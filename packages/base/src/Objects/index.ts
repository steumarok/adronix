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
      return new Ctor(args[0], args[1])
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
          constructor(
            params0: any,
            params1: any,
            params2: any,
            params3: any,
            params4: any,
            params5: any,
            params6: any,
            params7: any,
            params8: any,
            params9: any) {
            super(
              params0,
              params1,
              params2,
              params3,
              params4,
              params5,
              params6,
              params7,
              params8,
              params9);
          }
        };

        return <T>new instance(
          args[0],
          args[1],
          args[2],
          args[3],
          args[4],
          args[5],
          args[6],
          args[7],
          args[8],
          args[9]);
      } else {
          throw err
      }
    }

    return <T>instance;
}
