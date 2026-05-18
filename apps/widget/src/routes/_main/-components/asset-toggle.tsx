import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '#/components/ui/field'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'

export interface INetwork {
  name: string
  symbol: string
  description: string
}
export interface IAsset {
  name: string
  symbol: string
  icon: string
}

export interface IAssetsRender extends IAsset {
  networks: Array<INetwork>
}
export function renderAsset(
  asset: IAssetsRender,
  state: { asset: IAsset; network: INetwork },
  dispatch: any,
) {
  if ('networks' in asset) {
    return (
      <Card className="max-w-md w-full p-0">
        <CardContent className="p-2">
          <Collapsible
            key={asset.name}
            open={state.asset.symbol === asset.symbol}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="group w-full h-auto py-3 justify-start transition-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  dispatch({ type: 'SELECT_ASSET', payload: asset })
                }}
              >
                <img
                  src={asset.icon}
                  className="object-contain size-8 rounded-full aspect-square"
                />
                {asset.name}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 ml-5 style-nova:ml-4">
              <div className="flex flex-col gap-1">
                <RadioGroup
                  defaultValue={state.network.symbol}
                  onValueChange={(value) => {
                    const network = asset.networks.find(
                      (n) => n.symbol === value,
                    )
                    dispatch({ type: 'SELECT_NETWORK', payload: network })
                  }}
                  className="w-full"
                >
                  {asset.networks.map((network) => (
                    <FieldLabel htmlFor={network.symbol}>
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>
                            {network.name} {network.symbol}
                          </FieldTitle>
                          <FieldDescription>
                            {network.description}
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem
                          value={network.symbol}
                          id={network.symbol}
                        />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    )
  }
}
