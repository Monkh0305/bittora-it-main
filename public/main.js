;(function () {
  document.addEventListener('click', function (event) {
    const deleteButton = event.target.closest('[data-confirm-delete]')
    if (deleteButton) {
      const confirmed = window.confirm(
        deleteButton.getAttribute('data-confirm-delete') ||
          'Are you sure you want to delete this record?'
      )
      if (!confirmed) {
        event.preventDefault()
        return
      }
    }

    const printButton = event.target.closest('[data-print-report]')
    if (printButton) {
      window.print()
    }
  })
})()
