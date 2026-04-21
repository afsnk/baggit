import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'

interface FaqProps {
  title: string
  items: Array<{ id: string; question: string; answer: string }>
}

export function FaqsSection({ title, items }: FaqProps) {
  return (
    <div className="w-full">
      <div className="space-y-2">
        <h3 className="font-semibold text-3xl md:text-4xl m-0!">{title}</h3>
      </div>
      <Accordion
        className="space-y-1"
        collapsible
        type="single"
        defaultValue={items[0].id}
      >
        {items.map((item, i) => (
          <AccordionItem
            className="px-4 bg-muted rounded-md m-0!"
            key={`${item.id}-${i}`}
            value={item.id}
          >
            <AccordionTrigger className="max-h-xs text-xl md:text-lg font-semibold hover:no-underline focus-visible:underline focus-visible:ring-0">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="text-muted-foreground text-xs">
        Can't find what you're looking for? Contact our{' '}
        <a className="text-primary hover:underline" href="#">
          customer support team
        </a>
      </p>
    </div>
  )
}

const questions = [
  {
    id: 'item-1',
    title: 'What is Efferd?',
    content:
      'Efferd is a collection of beautifully crafted Shadcn UI blocks and components, designed to help developers build modern websites with ease.',
  },
  {
    id: 'item-2',
    title: 'Who can benefit from Efferd?',
    content:
      'Efferd is built for founders, product teams, and agencies that want to accelerate idea validation and delivery.',
  },
  {
    id: 'item-3',
    title: 'What features does Efferd include?',
    content:
      'Efferd offers a collaborative workspace where you can design and build beautiful web applications, with reusable UI blocks, deployment automation, and comprehensive analytics all in one place. With Efferd, you can streamline your team’s workflow and deliver high-quality websites quickly and efficiently.',
  },
  {
    id: 'item-4',
    title: 'Can I customize components in Efferd?',
    content:
      'Yes. Efferd offers editable design systems and code scaffolding so you can tailor blocks to your brand and workflow.',
  },
  {
    id: 'item-5',
    title: 'Does Efferd integrate with my existing tools?',
    content:
      'Efferd connects with popular source control, design tools, and cloud providers to fit into your current stack.',
  },
  {
    id: 'item-6',
    title: 'How do I get support while using Efferd?',
    content:
      'You can access detailed docs, community forums, and dedicated customer success channels for help at any time.',
  },
  {
    id: 'item-7',
    title: 'How do I get started with Efferd?',
    content:
      'You can access detailed docs, community forums, and dedicated customer success channels for help at any time.',
  },
]
