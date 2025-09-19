import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function NodeFAQ() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>How much can I earn?</AccordionTrigger>
            <AccordionContent>
              Earnings depend on bandwidth, storage, uptime, and datasets hosted. Use the calculator above.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>What's the minimum stake?</AccordionTrigger>
            <AccordionContent>
              0.1 U2U tokens required as stake when registering.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Can I stop anytime?</AccordionTrigger>
            <AccordionContent>
              Yes, deactivate your provider status and withdraw your stake anytime.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
