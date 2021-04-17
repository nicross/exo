content.materials.types = (() => {
  const registry = new Map()

  const prototypes = {
    Common: content.prop.material.common,
    Exotic: content.prop.material.exotic,
    Metal: content.prop.material.metal,
    Xenotech: content.prop.material.xenotech,
  }

  const weights = {
    Common: 20,
    Exotic: 5,
    Metal: 10,
    Xenotech: 1,
  }

  function toSlug(value) {
    return value.toLowerCase().replace(/\W/g, '-')
  }

  return {
    all: () => Array.from(registry.values()),
    choose: (value = Math.random()) => engine.utility.chooseWeighted(Array.from(registry.values()), value),
    get: (key) => registry.get(key),
    register: function ({
      name,
      type,
      weight,
    } = {}) {
      const key = toSlug(type) + '/' + toSlug(name)

      registry.set(key, {
        key,
        name,
        type,
        prototype: prototypes[type] || content.prop.material.base,
        weight: weight || weights[type] || 0,
      })

      return this
    },
  }
})()

content.materials.types.register({
  name: 'Carbon',
  type: 'Common',
})

content.materials.types.register({
  name: 'Hydrogen',
  type: 'Common',
})

content.materials.types.register({
  name: 'Lithium',
  type: 'Common',
})

content.materials.types.register({
  name: 'Nitrogen',
  type: 'Common',
})

content.materials.types.register({
  name: 'Oxygen',
  type: 'Common',
})

content.materials.types.register({
  name: 'Silicon',
  type: 'Common',
})

content.materials.types.register({
  name: 'Aluminum',
  type: 'Metal',
})

content.materials.types.register({
  name: 'Copper',
  type: 'Metal',
})

content.materials.types.register({
  name: 'Gold',
  type: 'Metal',
})

content.materials.types.register({
  name: 'Iron',
  type: 'Metal',
})

content.materials.types.register({
  name: 'Silver',
  type: 'Metal',
})

content.materials.types.register({
  name: 'Neodymium',
  type: 'Exotic',
})

content.materials.types.register({
  name: 'Plutonium',
  type: 'Exotic',
})

content.materials.types.register({
  name: 'Uranium',
  type: 'Exotic',
})

content.materials.types.register({
  name: 'Artifact',
  type: 'Xenotech',
})

content.materials.types.register({
  name: 'Black Box',
  type: 'Xenotech',
})
