export const classDecorator = (constructor: Function) => {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
};

export const methodDecorator = (value: boolean) =>{
  return (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      descriptor.enumerable = value;
    }
  };
};

export const accessorDecorator = (value: boolean) => {
  return (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      descriptor.configurable = value;
    }
  };
};

/** 
 * @Annotation
 * @param {boolean} value
 * @return {function(?, string, (PropertyDescriptor|undefined)): void}
 */
export const annotatedAccessorDecorator = (value: boolean) => {
  return (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      descriptor.configurable = value;
    }
  };
};
