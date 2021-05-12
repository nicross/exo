app.screen.upgrade = (() => {
  let invisibleIndicatorDowngrade,
    invisibleIndicatorUpgrade,
    root,
    upgrade,
    visibleIndicatorDowngrade,
    visibleIndicatorUpgrade

  engine.ready(() => {
    root = document.querySelector('.a-upgrade')

    invisibleIndicatorDowngrade = root.querySelector('.a-upgrade--invisibleIndicator-downgrade')
    invisibleIndicatorUpgrade = root.querySelector('.a-upgrade--invisibleIndicator-upgrade')
    visibleIndicatorDowngrade = root.querySelector('.a-upgrade--visibleIndicator-downgrade')
    visibleIndicatorUpgrade = root.querySelector('.a-upgrade--visibleIndicator-upgrade')

    visibleIndicatorDowngrade.addEventListener('animationend', onVisibleIndicatorAnimationend)
    visibleIndicatorUpgrade.addEventListener('animationend', onVisibleIndicatorAnimationend)

    app.state.screen.on('enter-upgrade', onEnter)
    app.state.screen.on('exit-upgrade', onExit)

    root.querySelector('.a-upgrade--back').addEventListener('click', onBackClick)
    root.querySelector('.a-upgrade--downgrade').addEventListener('click', onDowngradeClick)
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

  function hideInvisibleIndicators() {
    invisibleIndicatorDowngrade.hidden = true
    invisibleIndicatorUpgrade.hidden = true
  }

  function hideInvisibleIndicatorsOnBlur() {
    root.addEventListener('blur', function hideOnBlur() {
      hideInvisibleIndicators()
      root.removeEventListener('blur', hideOnBlur)
    })
  }

  function onBackClick() {
    app.state.screen.dispatch('back')
  }

  function onDowngradeClick() {
    if (this.getAttribute('aria-disabled') == 'true') {
      return
    }

    content.upgrades.downgrade(upgrade.key)
    update()

    showInvisibleIndicator(invisibleIndicatorDowngrade)
    triggerVisibleIndicator(visibleIndicatorDowngrade)

    app.utility.focus.set(root)

    hideInvisibleIndicatorsOnBlur()
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
    hideInvisibleIndicators()
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function onUpgradeClick() {
    if (this.getAttribute('aria-disabled') == 'true') {
      return
    }

    content.upgrades.upgrade(upgrade.key)
    update()

    showInvisibleIndicator(invisibleIndicatorUpgrade)
    triggerVisibleIndicator(visibleIndicatorUpgrade)

    app.utility.focus.set(root)

    hideInvisibleIndicatorsOnBlur()
  }

  function onVisibleIndicatorAnimationend() {
    this.hidden = true
  }

  function showInvisibleIndicator(element) {
    hideInvisibleIndicators()
    element.hidden = false
  }

  function triggerVisibleIndicator(element) {
    element.hidden = false
  }

  function update() {
    const next = upgrade.getNextLevel(),
      previous = upgrade.getPreviousLevel()

    root.querySelector('.a-upgrade--cost').hidden = !upgrade.getNextLevel()
    root.querySelector('.a-upgrade--cost').scrollTop = 0
    root.querySelector('.a-upgrade--downgrade').ariaDisabled = upgrade.canDowngrade() ? 'false' : 'true'
    root.querySelector('.a-upgrade--downgrade').innerHTML = previous ? `Downgrade to <strong>${upgrade.describePrevious()}</strong>` : 'Cannot downgrade'
    root.querySelector('.a-upgrade--description').innerHTML = upgrade.describe()
    root.querySelector('.a-upgrade--name').innerHTML = upgrade.name
    root.querySelector('.a-upgrade--upgrade').ariaDisabled = upgrade.canUpgrade() ? 'false' : 'true'
    root.querySelector('.a-upgrade--upgrade').innerHTML = next ? `Upgrade to <strong>${upgrade.describeNext()}</strong>` : 'Fully upgraded'

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
