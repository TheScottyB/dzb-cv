/**
 * Generic tool interface for agent tools
 */
export interface Tool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  parameters: {
    type: string;
    required: string[];
    properties: Record<
      string,
      {
        type: string;
        description: string;
      }
    >;
  };
  execute(input: TInput): Promise<TOutput>;
}
