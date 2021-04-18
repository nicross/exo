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
    Xenotech: 2.5,
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
      ...options // Fun fact: no comma allowed, "rest element must be last element"
    } = {}) {
      const key = toSlug(group) + '/' + toSlug(name)

      registry.set(key, {
        ...options,
        group,
        key,
        name,
        prototype: prototype || prototypes[group] || content.prop.material.base,
        weight: weight || weights[group] || 0,
      })

      return this
    },
    sort: (hash = {}) => {
      // hash is {material_key: mixed}

      const result = Array.from(Object.entries(hash))

      result.sort((a, b) => {
        const aType = registry.get(a[0]),
          bType = registry.get(b[0])

        if (aType.group == bType.group) {
          return aType.name.localeCompare(bType.name)
        }

        return weights[bType.group] - weights[aType.group]
      })

      return result
    },
  }
})()

content.materials.types.register({
  group: 'Common',
  name: 'Carbon',
  protons: 6,
})

content.materials.types.register({
  group: 'Common',
  name: 'Hydrogen',
  protons: 1,
})

content.materials.types.register({
  group: 'Common',
  name: 'Lithium',
  protons: 3,
})

content.materials.types.register({
  group: 'Common',
  name: 'Nitrogen',
  protons: 7,
})

content.materials.types.register({
  group: 'Common',
  name: 'Oxygen',
  protons: 8,
})

content.materials.types.register({
  group: 'Common',
  name: 'Silicon',
  protons: 14,
})

content.materials.types.register({
  group: 'Metal',
  name: 'Aluminum',
  protons: 13,
})

content.materials.types.register({
  group: 'Metal',
  name: 'Copper',
  protons: 29,
})

content.materials.types.register({
  group: 'Metal',
  name: 'Gold',
  protons: 79,
})

content.materials.types.register({
  group: 'Metal',
  name: 'Iron',
  protons: 26,
})

content.materials.types.register({
  group: 'Metal',
  name: 'Silver',
  protons: 47,
})

content.materials.types.register({
  group: 'Exotic',
  name: 'Neodymium',
  protons: 60,
})

content.materials.types.register({
  group: 'Exotic',
  name: 'Thorium',
  protons: 90,
})

content.materials.types.register({
  group: 'Exotic',
  name: 'Uranium',
  protons: 92,
})

content.materials.types.register({
  group: 'Xenotech',
  name: 'Artifact',
  protons: 666,
})
