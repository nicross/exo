app.screen.upgrade = (() => {
  let root

  engine.ready(() => {
    // TODO: upgrade button - call upgrade, update the page content, focus root

    root = document.querySelector('.a-upgrade')

    app.state.screen.on('enter-upgrade', onEnter)
    app.state.screen.on('exit-upgrade', onExit)

    root.querySelector('.a-upgrade--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)
  })

  function getTableData(cost = {}) {
    return content.materials.types.sort(cost).map(([key, count]) => ({
      ...content.materials.types.get(key),
      cost: count,
      total: content.inventory.get(key),
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

  function onEnter({
    upgrade = {},
  } = {}) {
    root.querySelector('.a-upgrade--cost').hidden = !upgrade.getNextLevel()
    root.querySelector('.a-upgrade--description').innerHTML = upgrade.describe()
    root.querySelector('.a-upgrade--name').innerHTML = upgrade.name
    root.querySelector('.a-upgrade--upgrade').disabled = upgrade.canUpgrade()
    root.querySelector('.a-upgrade--upgrade').innerHTML = upgrade.describeNext()

    updateTable(upgrade.getNextCost())

    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.set(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function updateTable(cost = {}) {
    const data = getTableData(cost)

    let html = ''

    for (const row of data) {
      html += `<tr tabindex="0">
        <th scope="row">${row.name}</th>
        <td>${row.total} <abbr aria-label="of">/</abbr> ${row.cost}</td>
        <td>${row.group}</td>
      </tr>`
    }

    root.querySelector('.a-upgrade--table').innerHTML = html
  }

  return {}
})()
