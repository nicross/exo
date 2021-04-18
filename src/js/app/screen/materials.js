app.screen.materials = (() => {
  let root,
    table

  engine.ready(() => {
    root = document.querySelector('.a-materials')
    table = root.querySelector('.a-materials--table')

    app.state.screen.on('enter-materials', onEnter)
    app.state.screen.on('exit-materials', onExit)

    root.querySelector('.a-materials--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)
    app.utility.input.preventScrolling(root.querySelector('.a-materials--data'))
  })

  function getTableData() {
    return content.materials.types.sort(
      content.inventory.export()
    ).map(([key, count]) => ({
      ...content.materials.types.get(key),
      count,
    }))
  }

  function handleControls() {
    const ui = app.controls.ui()

    if (ui.backspace || ui.cancel || ui.escape) {
      return onBackClick()
    }

    if (ui.confirm) {
      const focused = app.utility.focus.get(root)

      if (focused) {
        return focused.click()
      }
    }

    if ('focus' in ui) {
      const toFocus = app.utility.focus.selectFocusable(root)[ui.focus]

      if (toFocus) {
        if (app.utility.focus.is(toFocus)) {
          return toFocus.click()
        }

        return app.utility.focus.set(toFocus)
      }
    }

    if (ui.up) {
      return app.utility.focus.setPreviousFocusable(root)
    }

    if (ui.down) {
      return app.utility.focus.setNextFocusable(root)
    }
  }

  function onBackClick() {
    app.state.screen.dispatch('back')
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    updateTable()
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function updateTable() {
    const capacity = content.inventory.capacity(),
      data = getTableData()

    let html = ''

    for (const row of data) {
      const count = row.count < capacity
        ? `${row.count} <abbr aria-label="of">/</abbr> ${capacity}`
        : 'FULL'

      html += `<tr tabindex="0">
        <th class="a-materials--name" scope="row">${row.name}</th>
        <td class="a-materials--count">${count}</td>
        <td class="a-materials--group">${row.group}</td>
      </tr>`
    }

    table.innerHTML = html
  }

  return {}
})()
