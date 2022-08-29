export class ColumnNumericTransformer {
    to(data: number): number {
      return data;
    }
    from(data: string): number {
      return (data == null || data === "") ? null : parseFloat(data);
    }
}