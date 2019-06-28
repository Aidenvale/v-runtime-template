const defineDescriptor = (src, dest, name) => {
  if (!dest.hasOwnProperty(name)) {
    const descriptor = Object.getOwnPropertyDescriptor(src, name);
    Object.defineProperty(dest, name, descriptor);
  }
};

const merge = objs => {
  const res = {};
  objs.forEach(obj => {
    obj &&
      Object.getOwnPropertyNames(obj).forEach(name =>
        defineDescriptor(obj, res, name)
      );
  });
  return res;
};

const buildFromProps = (obj, props) => {
  const res = {};
  props.forEach(prop => defineDescriptor(obj, res, prop));
  return res;
};

export default {
  props: {
    template: String,
    parent: Object,
    templateProps: {
      type: Object,
      default: () => ({})
    }
  },
  render(h) {
    if (this.template) {
      const parent = this.parent || this.$parent
      const {
        $data: parentData = {},
        $props: parentProps = {},
        $options: parentOptions = {}
      } = parent;
      const {
        components: parentComponents = {},
        computed: parentComputed = {},
        methods: parentMethods = {}
      } = parentOptions;
      const {
        $data = {},
        $props = {},
        $options: { methods = {}, computed = {}, components = {} } = {}
      } = this;
      const passthrough = {
        $data: {},
        $props: {},
        $options: {},
        components: {},
        computed: {},
        methods: {}
      };

      //build new objects by removing keys if already exists (e.g. created by mixins)
      Object.keys(parentData).forEach(e => {
        if (typeof $data[e] === "undefined")
          passthrough.$data[e] = parentData[e];
      });
      Object.keys(parentProps).forEach(e => {
        if (typeof $props[e] === "undefined")
          passthrough.$props[e] = parentProps[e];
      });
      Object.keys(parentMethods).forEach(e => {
        if (typeof methods[e] === "undefined")
          passthrough.methods[e] = parentMethods[e];
      });
      Object.keys(parentComputed).forEach(e => {
        if (typeof computed[e] === "undefined")
          passthrough.computed[e] = parentComputed[e];
      });
      Object.keys(parentComponents).forEach(e => {
        if (typeof components[e] === "undefined")
          passthrough.components[e] = parentComponents[e];
      });

      const methodKeys = Object.keys(passthrough.methods || {});
      const dataKeys = Object.keys(passthrough.$data || {});
      const propKeys = Object.keys(passthrough.$props || {});
      const templatePropKeys = Object.keys(this.templateProps);
      const allKeys = dataKeys.concat(propKeys).concat(methodKeys).concat(templatePropKeys);
      const methodsFromProps = buildFromProps(parent, methodKeys);
      const finalProps = merge([
        passthrough.$data,
        passthrough.$props,
        methodsFromProps,
        this.templateProps
      ]);

      const dynamic = {
        template: this.template || "<div></div>",
        props: allKeys,
        computed: passthrough.computed,
        components: passthrough.components,
        provide: provide
      };

      return h(dynamic, { props: finalProps });
    }
  }
};
