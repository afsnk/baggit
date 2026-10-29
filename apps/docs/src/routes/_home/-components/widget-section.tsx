import { Container, Section } from "#/components/craft";
// import { EditableHeadline } from "#/components/text-drum-2";
import { MultiplexerHeadline } from "#/components/text-drum-3";
import { EmblaCarousel } from "#/components/text-drum-4";
import { Link005 } from "#/components/ui/skiper-ui/skiper40";



interface WidgetSectionProps { }
export default function ({ }: WidgetSectionProps) {

	return (
		<Section className="grid w-full grid-cols-1 md:grid-cols-2 pb-56! pt-24! gap-14 sm:gap-4">
			<Container className="w-full min-h-2/3 h-full text-right flex px-4 sm:px-0 items-start justify-center sm:items-center sm:justify-end">
				<h4 className="font-boing font-semibold text-xl sm:text-2xl text-secondary-foreground/40 m-0! border border-gray-400/40 p-3 rounded-lg">SEND $25 to {"<amy@baggit.link>"}</h4>
			</Container>
			<Container className="flex flex-col w-full items-start justify-center px-4 sm:px-0">
				<h3 className="m-0! text-left font-boing opacity-45 font-bold pl-2">Effort made easy.</h3>
				<span className="text-2xl mt-2 sm:mt-8 flex font-boing">
					<Link005 href={"/widget" as any} className="no-underline! font-semibold opacity-45 hover:opacity-100 transition-all mr-1">Widgets?</Link005><strong className="italic">YES!</strong>
				</span>
				<p className="flex text-wrap text-2xl pl-2 font-boing">So you can <strong className="italic ml-1">START BUILDING!</strong></p>
			</Container>
		</Section>
	)
}
