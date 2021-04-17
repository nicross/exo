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
      group,
      prototype,
      name,
      weight,
    } = {}) {
      const key = toSlug(group) + '/' + toSlug(name)

      registry.set(key, {
        group,
        key,
        name,
        prototype: prototype || prototypes[group] || content.prop.material.base,
        weight: weight || weights[group] || 0,
      })

      return this
    },
  }
})()

content.materials.types.register({
  group: 'Common',
  name: 'Carbon',
})

content.materials.types.register({
  group: 'Common',
  name: 'Hydrogen',
})

content.materials.types.register({
  group: 'Common',
  name: 'Lithium',
})

content.materials.types.register({
  group: 'Common',
  name: 'Nitrogen',
})

content.materials.types.register({
  group: 'Common',
  name: 'Oxygen',
})

content.materials.types.register({
  group: 'Common',
  name: 'Silicon',
})

content.materials.types.register({
  group: 'Metal',
  name: 'Aluminum',
})

content.materials.types.register({
  group: 'Metal',
  name: 'Copper',
})

content.materials.types.register({
  group: 'Metal',
  name: 'Gold',
})

content.materials.types.register({
  group: 'Metal',
  name: 'Iron',
})

content.materials.types.register({
  group: 'Metal',
  name: 'Silver',
})

content.materials.types.register({
  group: 'Exotic',
  name: 'Neodymium',
})

content.materials.types.register({
  group: 'Exotic',
  name: 'Plutonium',
})

content.materials.types.register({
  group: 'Exotic',
  name: 'Uranium',
})

content.materials.types.register({
  group: 'Xenotech',
  name: 'Artifact',
})

content.materials.types.register({
  group: 'Xenotech',
  name: 'Black Box',
})
