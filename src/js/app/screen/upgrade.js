app.screen.upgrade = (() => {
  let invisibleIndicator,
    root,
    upgrade,
    visibleIndicator

  engine.ready(() => {
    root = document.querySelector('.a-upgrade')
    invisibleIndicator = root.querySelector('.a-upgrade--invisibleIndicator')
    visibleIndicator = root.querySelector('.a-upgrade--visibleIndicator')

    visibleIndicator.addEventListener('animationend', onVisibleIndicatorAnimationend)

    app.state.screen.on('enter-upgrade', onEnter)
    app.state.screen.on('exit-upgrade', onExit)

    root.querySelector('.a-upgrade--back').addEventListener('click', onBackClick)
    root.querySelector('.a-upgrade--upgrade').addEventListener('click', onUpgradeClick)

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

  function hideInvisibleIndicator() {
    invisibleIndicator.hidden = true
  }

  function onBackClick() {
    app.state.screen.dispatch('back')
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter({
    upgrade: selectedUpgrade = {},
  } = {}) {
    upgrade = selectedUpgrade
    update()

    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.set(root)
  }

  function onExit() {
    hideInvisibleIndicator()
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function onUpgradeClick() {
    if (this.getAttribute('aria-disabled') == 'true') {
      return
    }

    content.upgrades.upgrade(upgrade.key)
    update()
    showInvisibleIndicator()
    triggerVisibleIndicator()
    app.utility.focus.set(root)
  }

  function onVisibleIndicatorAnimationend() {
    visibleIndicator.hidden = true
  }

  function showInvisibleIndicator() {
    invisibleIndicator.hidden = false
  }

  function triggerVisibleIndicator() {
    visibleIndicator.hidden = false
  }

  function update() {
    root.querySelector('.a-upgrade--cost').hidden = !upgrade.getNextLevel()
    root.querySelector('.a-upgrade--cost').scrollTop = 0
    root.querySelector('.a-upgrade--description').innerHTML = upgrade.describe()
    root.querySelector('.a-upgrade--name').innerHTML = upgrade.name
    root.querySelector('.a-upgrade--upgrade').ariaDisabled = upgrade.canUpgrade() ? 'false' : 'true'
    root.querySelector('.a-upgrade--upgrade').innerHTML = upgrade.describeNext()

    updateTable(upgrade.getNextCost())
  }

  function updateTable(cost = {}) {
    const data = getTableData(cost),
      table = root.querySelector('.a-upgrade--table')

    let html = ''

    for (const row of data) {
      html += `<tr tabindex="0">
        <th scope="row">${row.name}</th>
        <td>${row.total} <abbr aria-label="of">/</abbr> ${row.cost}</td>
        <td>${row.group}</td>
      </tr>`
    }

    table.innerHTML = html
  }

  return {}
})()
