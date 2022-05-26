const classMap = {}

export function override<T>(
    base: { new (...args: any[]): T },
    fn: (base: { new (...args: any[]): T }) => { new (...args: any[]): T }
) {
    const current = classMap[base.name] || base
    const cls = fn(current);
    classMap[base.name] = cls
    return cls
}


export function create<T>(Ctor: { new (...args: any[]): T }, ...args: any[]): T {
    const name = Ctor.name
    const classRef: { new (...args: any[]): any; } = classMap[name];

    if (!classRef) {
      throw new Error(`The class '${name}' was not found`);
    }

    let instance = Object.create(classRef.prototype);

    try {
        instance.constructor.apply(instance, args);
    } catch (err) {
      /**
       * For ES2015(ES6): constructor.apply is not allowed
       */
      if (/Class constructor/.test(err.toString())) {
        instance = class extends classRef {
          constructor(...params: any[]) {
            super(...params);
          }
        };

        return <T>new instance(args);
      } else {
          throw err
      }
    }

    return <T>instance;
}
