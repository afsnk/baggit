import { betterAuth, BetterAuthOptions, type Auth } from "better-auth";
import { apiKey } from "@better-auth/api-key"
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import { organization, anonymous, bearer, emailOTP } from "better-auth/plugins"
import { DB } from "../db";
import * as schema from "@core/adapters/db/schema"
import { defaultAuthConfig } from "./better-auth.config";
import { useLogger } from "evlog/elysia"
import { createError } from "evlog"


export const createAuth = (db: DB, overrideAuthConfig?: BetterAuthOptions) =>
	betterAuth({
		database: drizzleAdapter(db, {
	    provider: "sqlite",
	    schema: {...schema},
		}),
		// TODO: Move to merchant config extension
		databaseHooks: {
	    session: {
	      create: {
	        before: async (session) => {
	          // Get the first organization that the user is a member of
	          const member = await db.query.member.findFirst({
	            where: (fields, ops) => ops.eq(fields.userId, session.userId),
	          })

	          console.log(`Members`, {member})

	          if (!member) {
	            return {data: {...session}}
	          }

	          return {
	            data: {
	              ...session,
	              activeOrganizationId: member?.organizationId
	            }
	          }
	        }
	      }
	    }
	  },
	  // secondaryStorage,
		plugins: [
	    apiKey([
	      {
	        configId: "public",
	        defaultPrefix: "pk_",
	        storage: "database", // Update to use secondary-storage with nats jetstream cache
	        references: "organization",
	        rateLimit: {
	          enabled: true,
	          maxRequests: 100,
	          timeWindow: 1000 * 60 * 60, // 1 hour
	        },
	      },
	      {
	        configId: "secret",
	        defaultPrefix: "sk_",
	        enableMetadata: true,
	        storage: "database", // Update to use secondary-storage with nats jetstream cache
	        references: "organization",
	        rateLimit: {
	          enabled: true,
	          maxRequests: 1000,
	          timeWindow: 1000 * 60 * 60, // 1 hour
	        },
	      },
	    ]),
	    organization({
	      allowUserToCreateOrganization(user) {
	        return user.emailVerified
				},
					sendInvitationEmail: async (data) => {
						const log = useLogger()
						const email = data.email.trim()

						// await emailQueue.enqueue<IEmailProps>('send', {
						// 	to: email,
						// 	subject: `Baggit - Organization team invite`,
						// 	body: await renderTemplate({
						// 		name: "merchantTeamInvite",
						// 		props: {
						// 			invitedByEmail: data.inviter.user.email,
						// 			invitedByUsername: data.inviter.user.name,
						// 			userEmail: email,
						// 			teamName: data.organization.name,
						// 			inviteLink: `${env.MERCHANT_CLIENT_URL}/settings/general` // Go to general settings to view invite and accept
						// 		}
						// 	})
						// }).catch((error) => log.error(error, {message: 'Failed to enqueue email on email queue'}));
					},
					organizationHooks: {
						async afterAddMember(data) {
							// TODO: send welcome to organization email
						},
	        async afterCreateOrganization({ organization }) {
	          // const log = useLogger()
	          // try {
	            // TODO: Initialise organization resources after creation
		//             const chain = getChain("bsc")
		//             const account = await generateAccount(chain, organization.id)
		//
		//             log.set({ account, chain });
		//
		//             const [updatedOrg] = await db.update(schema.organization)
		//               .set({
		//                 metadata: {
		//                   ...organization?.metadata,
		//                   ...account
		//                 } as any
		//               })
		//               .where(eq(schema.organization.id, organization.id))
		//               .returning()
	            // log.set({orgWithAddress: updatedOrg})
	          // } catch (error: any) {
	          //   log.error(error)
	          //   throw createError({
	          //     message: error?.message,
	          //     why: "Failed to created organization address",
	          //     fix: "Try again later, contact support"
	          //   })
	          // }
	        },
	      }
	    }),
	    anonymous({
	      onLinkAccount: async ({ anonymousUser, newUser }) => {
	        // Hanle linking from anonymous to authed user
	        console.log(`Anonymous and New user`, {anonymousUser, newUser})
	      }
	    }),
	    emailOTP({
	      async sendVerificationOTP({ email, otp, type }) {
	          if (type === "sign-in") {
	            // Send the OTP for sign in
	            // await sendEmail({
	            //   to: email,
	            //   subject: `Confirm your signin`,
	            //   body: `Use the code: ${otp} to signin`,
	            // })
	          } else if (type === "email-verification") {
	            // Send the OTP for email verification
	            // await sendEmail({
	            //   to: email,
	            //   subject: `Verify your email`,
	            //   body: `Use the code: ${otp} to verify your email`,
	            // })
	          } else {
	              // Send the OTP for password reset
	          }
	      },
	    }),
	    // jwt({
	    //   jwt: {
	    //     issuer: env.BETTER_AUTH_URL,
	    //     audience: "https://pay.baggit.dev",
	    //     expirationTime: "3m",
	    //     definePayload: ({ user, session }) => ({
	    //       sub: session.id,
	    //       scope: [
	    //         "/v1/payment/:invoiceRef",
	    //         "/v1/transaction/init",
	    //         "/v1/transaction/confirm"
	    //       ]
	    //     }),
	    //     rotationInterval: 60 * 60 * 24 * 30, // 30 days
	    //     gracePeriod: 60 * 60 * 24 * 30 // 30 days
	    //   }
	    // }),
			bearer(),
			...(defaultAuthConfig.plugins || []),
			...(overrideAuthConfig && overrideAuthConfig.plugins || []),
		],
		...defaultAuthConfig,
		...overrideAuthConfig,
	}) as Auth
