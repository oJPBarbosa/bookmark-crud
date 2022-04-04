import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser: (...dataOrPipes: unknown[]) => ParameterDecorator =
  createParamDecorator(
    (data: string | undefined, context: ExecutionContext): any => {
      const request: any = context.switchToHttp().getRequest();

      if (data) {
        return request?.user[data];
      }

      return request?.user;
    },
  );
