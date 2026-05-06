import Decimal from 'decimal.js';
import { IAsset } from '../interfaces/asset.interface';

export class AssetStringMapper {
  public static toDecimal(assetString: string): IAsset {
    const [name, value] = assetString.split(' ');

    return { name, value: new Decimal(value) };
  }
}
