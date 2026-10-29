import { Container, Section } from "#/components/craft";
import type { ReceiptPrinterHandle } from "#/components/receipt-printer";
import ReceiptPrinter from "#/components/receipt-printer";
import { CardSpotlight } from "#/components/ui/card-spotlight";
import { Link004 } from "#/components/ui/skiper-ui/skiper40";
import { useMediaQuery } from "#/hooks/use-media-query";
import { useRef } from "react";



interface CheckoutSectionProps { }
export default function ({ }: CheckoutSectionProps) {
	const printerRef = useRef<ReceiptPrinterHandle>(null);
	const isMobile = useMediaQuery("(max-width: 768px)")

	return (
		<Section className="grid w-full grid-cols-1 md:grid-cols-2 md:py-48">
			<Container className="flex flex-col items-start justify-center py-4 sm:py-0">
				<h3 className="m-0! text-left font-boing opacity-45 font-bold pl-2">Business Priorities in Order.</h3>
				<p className="text-balance pl-2 font-boing leading-tight tracking-wide">Your top priority is to sales,<br/> finding someone, anyone willing to <strong className="italic">PAY</strong></p>

				<span className="text-2xl mt-8 flex flex-col sm:flex-row font-boing">
					<Link004 href={"/checkout" as any} className="no-underline! font-semibold opacity-45 hover:opacity-100 transition-all">Checkout</Link004>
					<span className="pl-2 sm:pl-0">for when you find that <strong className="italic sm:ml-1.5">PERSON.</strong></span>
				</span>
			</Container>
			<Container className="py-0! w-full min-h-2/3 h-full">
				<CardSpotlight
					className="w-full h-[45vh] sm:h-full group"
					onMouseLeave={() => printerRef.current?.reset()}
					onMouseEnter={() => !isMobile && printerRef.current?.open()}
					onClick={() => {
						if (isMobile) {
							printerRef.current?.reset();
							printerRef.current?.open();
						}
					}}
				>
					<div className="relative flex flex-col w-full h-full">
						<p className="absolute top-1/2 left-1/2 -translate-1/2 font-mono uppercase">CLICK/HOVER HERE</p>
						<ReceiptPrinter ref={printerRef} />
					</div>
        </CardSpotlight>
			</Container>
		</Section>
	)
}
