import { Container, Section } from "#/components/craft";
import SqueezeCarousel, { action, mark, settings, type SqueezeSlide } from "#/components/fancy-carousel";
import { Link004, Link005 } from "#/components/ui/skiper-ui/skiper40";
import { useMediaQuery } from "#/hooks/use-media-query";
import { Link } from "@tanstack/react-router";



interface PayoutSectionProps { }
export default function ({ }: PayoutSectionProps) {

	const slides: SqueezeSlide[] = [
    {
        id: "grid",
        title: "A layout engine that finally respects the fold.",
        description:
            "Grid 2.0 measures the viewport before it paints, so the first screen lands in one frame on any device.",
				action: "Read the notes",
        overlay: mark("Grid 2.0"),
				image: "https://cdn.21st.dev/assets/mirror/a8/a8421ae3451a9f48be46f70047eb709e72d98bf9bde7369c197f6a254b82b562.webp",
        // background: "#BBA88F",
        imageAlt: "A glass office facade at dusk, its windows in a strict grid",
    },
    {
        id: "studio",
        title: "Design tokens now sync both ways.",
        description:
            "Change a colour in the editor and the repo follows; change it in the repo and the editor catches up on the next pull.",
        action: "See how it works",
        overlay: mark("Studio"),
        image: "https://cdn.21st.dev/assets/mirror/e7/e7a8c45ed78fd2bde1dc0d421a06f0b7fb1b9b4e20cd7aa4619f2529667737ea.webp",
        imageAlt: "A desk from above with paper colour chips fanned out in morning light",
    },
    {
        id: "edge",
        title: "Cold starts are down to 11 milliseconds.",
        description:
            "A rewritten scheduler keeps a warm pool near every region, so the first request costs about what the tenth does.",
        action: "Read the benchmark",
        overlay: mark("Edge runtime"),
        image: "https://cdn.21st.dev/assets/mirror/89/89bc9699cff61aae0e9f6ef16587ad3d1a52f8e6870483d05696d354f1d08ffe.webp",
        imageAlt: "A motorway interchange at night, traffic drawn out into ribbons of light",
    },
    {
        id: "release",
        title: "Ninety-four changes in one release.",
        description:
            "Charts, forms, and the whole command palette were rebuilt this quarter. Here is everything that moved.",
        action: "Browse the changelog",
        overlay: mark("Summer release"),
        image: "https://cdn.21st.dev/assets/mirror/a6/a6a75d4d0ff750d29a0b7031b8c900bfd02e92ef50329ecec760e988d25e0325.webp",
        imageAlt: "Layered mountain ridges fading into haze at golden hour",
    },
    {
        id: "insights",
        title: "Every query, traced end to end.",
        description:
            "Follow one request from the browser through the queue and into the database, with the slow step marked for you.",
        action: "Open a demo trace",
        overlay: mark("Insights"),
        image: "https://cdn.21st.dev/assets/mirror/b7/b7c4a295d9702b01f3dd00327f50b770e93446e84b4cf9dee5840fcb216a5af0.webp",
        imageAlt: "Fibre optic strands fanning out in the dark, each tip glowing",
    },
    {
        id: "handbook",
        title: "How we run a team of forty without standups.",
        description:
            "Written decisions, one weekly review, and a shared calendar. Our handbook is open, so take what works.",
        action: "Read the handbook",
        overlay: mark("Handbook"),
        image: "https://cdn.21st.dev/assets/mirror/35/35b0d4180af97a8e61675a54eaf1d6bf1420aca8f0c80c1837d5517036dc30a4.webp",
        imageAlt: "Three colleagues talking around a table by a window in a bright office",
    },
    {
        id: "craft",
        title: "The tools we make are the ones we use.",
        description:
            "Every part of the platform is built by the people who run on it, and shipped only once they trust it themselves.",
        action: "Meet the team",
        overlay: mark("Workshop"),
        image: "https://cdn.21st.dev/assets/mirror/bf/bf148e218ce4fbc05d0f32648209459a9ef5a35fa86394a97c4c8176ed31231b.webp",
        imageAlt: "Hands raising wet clay on a potter's wheel in a sunlit workshop",
    },
	];
	const isMobile = useMediaQuery("(max-width: 768px)")

	return (
		<Section className="grid w-full place-items-stretch md:pb-44 px-4 sm:px-0">
			<Container className="w-full sm:w-auto flex flex-col items-start justify-start">
				<span className="text-2xl mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-center font-boing text-balance">
					<Link004 href={"/payout" as any} className="no-underline! font-semibold opacity-45 hover:opacity-100 transition-all">Payout</Link004>
					<span className="pl-2 sm:pl-0">for world<strong className="italic ml-1.5">DOMINATION?</strong></span>
				</span>
				<p className="text-2xl pl-2 font-boing">
					You <strong className="italic">LET US KNOW.</strong>
				</p>
			</Container>
			<SqueezeCarousel slides={slides} label="What we shipped" {...{...settings, height: isMobile? 340 : settings.height}} controls={isMobile} />
		</Section>
	)
}
