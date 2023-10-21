const $ = (e) => document.querySelector(e)
const $btnShowModalReminder = $('#btn-add')
const $modalAddReminder = $('#modal-add-reminder')
const $btnClose = $('#btn-close')
const $btnAddReminder = $('#btn-submit')
const $remindersList = $('#reminders-list')
const $formAddReminder = $('#form-add-reminder')
const $modalConfig = $('#modal-config')
const $btnConfig = $('.btn-confg')
const $btnCloseConfig = $('#btn-close-config')
const $btnSaveConfig = $('#btn-save-config')
const $formConfig = $('#form-config')
const $modalFirstInstructions = $('#modal-first-instructions')
const $btnCloseFirstInstructions = $('#btn-close-first-instructions')
const $inputTime = $('#time')

$inputTime.min = new Date().toISOString().split('.')[0].slice(0, -3)

console.log($inputTime.min)

const reminders = JSON.parse(window.localStorage.getItem('reminders'))?.filter((reminder) => {
  console.log(reminder.dateOfReminder > new Date())
  return new Date(reminder.dateOfReminder) > (new Date())
}) ?? []
window.localStorage.setItem('reminders', JSON.stringify(reminders))

const chatIdAux = window.localStorage.getItem('chatId') ?? null

if (chatIdAux) {
  $formConfig.elements.chatId.value = chatIdAux
} else {
  $modalFirstInstructions.showModal()
}

function addReminder ({ reminder }) {
  $remindersList.innerHTML += `<li>
    <span><h3>${reminder.title}</h3><p>${reminder.description}</p></span>
    <h5>🕛${new Date(reminder.dateOfReminder).toLocaleString()}</h5>
</li>`
}

function loadReminders () {
  reminders.forEach(reminder => addReminder({ reminder }))
}

async function checkValidChatId () {
  const chatId = window.localStorage.getItem('chatId')
  const res = await fetch('http://localhost:3000/verify-telegram-id', {
    method: 'POST',
    body: JSON.stringify({ chatId }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).catch(err => {
    return { error: true, message: err.message }
  })

  if (!res.error) {
    return true
  }

  return false
}

function sendReminder (reminder) {
  const chatId = window.localStorage.getItem('chatId')
  console.log(chatId)
  fetch('http://localhost:3000/send-reminder', {
    method: 'POST',
    body: JSON.stringify({ chatId, reminder }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).catch(err => {
    console.log(err)
  })
}

loadReminders()

$btnShowModalReminder.addEventListener('click', () => {
  $modalAddReminder.showModal()
})

$btnClose.addEventListener('click', (e) => {
  e.preventDefault()
  $modalAddReminder.close()
})

$btnConfig.addEventListener('click', (e) => {
  e.preventDefault()
  $modalConfig.showModal()
})

$btnCloseConfig.addEventListener('click', (e) => {
  e.preventDefault()
  $modalConfig.close()
})

$btnCloseFirstInstructions.addEventListener('click', (e) => {
  e.preventDefault()
  $modalFirstInstructions.close()
})

$btnAddReminder.addEventListener('click', (e) => {
  e.preventDefault()
  const $title = $('#title')
  const $description = $('#description')
  const $time = $('#time')
  const $week = $('#week')
  const $hour = $('#hour')
  const $day = $('#day')
  const $minutes = $('#minutes')

  const title = $title.value
  const description = $description.value
  const dateOfReminder = $time.value
  const dateToRemember = []

  if ($week.checked) {
    dateToRemember.push('week')
  }
  if ($day.checked) {
    dateToRemember.push('day')
  }
  if ($hour.checked) {
    dateToRemember.push('hour')
  }
  if ($minutes.checked) {
    dateToRemember.push('minutes')
  }

  if (!title || !description || !dateOfReminder) {
    window.alert('Please fill all fields')
    return
  }

  const reminder = {
    title,
    description,
    dateOfReminder,
    dateToRemember
  }

  reminders.push(reminder)
  sendReminder(reminder)
  window.localStorage.setItem('reminders', JSON.stringify(reminders))
  addReminder({ reminder })
  $formAddReminder.reset()
  $modalAddReminder.close()
})

$btnSaveConfig.addEventListener('click', (e) => {
  e.preventDefault()
  const chatId = $formConfig.elements.chatId.value
  console.log(chatId)
  window.localStorage.setItem('chatId', chatId)
  const chatIdValid = checkValidChatId()

  if (chatIdValid.error) {
    window.alert('Ha ocurrido un error con el sistema, intente de nuevo mas tarde')
    return
  }

  if (chatIdValid) {
    window.alert('Chat id guardado correctamente')
  } else {
    window.alert('Chat id invalido')
  }
  $formConfig.elements.chatId.value = chatId
  $modalConfig.close()
})
