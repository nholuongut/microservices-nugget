interface ErrorInterface {
    name: string;
    statusCode: number;
    description: string;
    data?: unknown
    message?: string
  }
  
  export { ErrorInterface };
  