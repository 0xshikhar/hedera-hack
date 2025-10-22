'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, TreeDeciduous, Car, Smartphone } from 'lucide-react';
import { carbonCalculator, type CarbonCalculation } from '@/services/carbon';

interface CarbonFootprintProps {
  calculation: CarbonCalculation;
  showDetails?: boolean;
}

export function CarbonFootprint({ calculation, showDetails = true }: CarbonFootprintProps) {
  const rating = carbonCalculator.getSustainabilityRating(calculation.co2Grams);
  const formatted = carbonCalculator.formatCarbonFootprint(calculation.co2Grams);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'A':
        return 'bg-green-500';
      case 'B':
        return 'bg-green-400';
      case 'C':
        return 'bg-yellow-500';
      case 'D':
        return 'bg-orange-500';
      case 'E':
        return 'bg-red-500';
      case 'F':
        return 'bg-red-700';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Carbon Footprint
          </CardTitle>
          <Badge className={getRatingColor(rating.rating)}>
            Rating: {rating.rating}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Carbon Display */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-3xl font-bold text-gray-900">{formatted}</div>
          <p className="text-sm text-gray-600 mt-1">{rating.description}</p>
        </div>

        {showDetails && (
          <>
            {/* Energy Consumption */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Energy Used:</span>
                <span className="font-medium">{calculation.energyKwh.toFixed(4)} kWh</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Compute Time:</span>
                <span className="font-medium">
                  {(calculation.computeTimeMs / 1000).toFixed(2)}s
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">
                  {calculation.provider} / {calculation.model}
                </span>
              </div>
            </div>

            {/* Equivalents */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                This is equivalent to:
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <TreeDeciduous className="h-6 w-6 mx-auto mb-1 text-green-600" />
                  <div className="text-lg font-bold text-gray-900">
                    {calculation.equivalents.trees}
                  </div>
                  <div className="text-xs text-gray-600">
                    tree{calculation.equivalents.trees !== 1 ? 's' : ''}/year
                  </div>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Car className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <div className="text-lg font-bold text-gray-900">
                    {calculation.equivalents.carMiles}
                  </div>
                  <div className="text-xs text-gray-600">miles driven</div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Smartphone className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                  <div className="text-lg font-bold text-gray-900">
                    {calculation.equivalents.phoneCharges}
                  </div>
                  <div className="text-xs text-gray-600">phone charges</div>
                </div>
              </div>
            </div>

            {/* Offset Cost */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Offset Cost:</span>
                <span className="text-lg font-bold text-green-600">
                  ${calculation.offsetCost.toFixed(4)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Estimated cost to offset this carbon emission
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
