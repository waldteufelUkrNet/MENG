"use strict"
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ variables declaration ↓↓↓ */
  const form      = document.forms.userForm,
        inputId   = form.querySelector('input[type="hidden"][name="id"]'),
        inputName = form.querySelector('input[name="name"]'),
        inputAge  = form.querySelector('input[name="age"]'),
        btnSave   = form.querySelector('button[type="submit"]'),
        btnReset  = form.querySelector('button[type="button"]'),
        table     = document.getElementById('clientsTable');
/* ↑↑↑ /variables declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ workflow ↓↓↓ */
  getAllUsers();
/* ↑↑↑ /workflow ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ event handlers ↓↓↓ */
  // save/resave item
  form.addEventListener('submit', function(event){
    event.preventDefault();
    submitForm();
  });

  // reset form
  btnReset.addEventListener('click', function(event){
    resetForm();
  });

  table.addEventListener('click', function(event){
    // download item for saving
    if ( event.target.closest('button[data-role="change"]') ) {
      let id = event.target.closest('tr').getAttribute('id');
      downloadCurrentUser(id);
    }
    // delete item
    if ( event.target.closest('button[data-role="delete"]') ) {
      let id = event.target.closest('tr').getAttribute('id');
      deleteCurrentUser(id);
    }
  });
/* ↑↑↑ /event handlers ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ functions declaration ↓↓↓ */
  async function getAllUsers(){
    let response = await fetch('api/users',{
      method: 'GET',
      headers: {"Accept":"application/json"}
    });
    if (response.ok) {
      let users = await response.json();
      users.forEach( user => {
        addUserLine(user);
      });

    } else {
      console.log('проблеми з підключенням до бази даних');
    }
  }

  async function deleteCurrentUser(id) {
    let response = await fetch('api/users/' + id, {
      method: 'DELETE',
      headers: {"Accept":"application/json"},
    });
    if (response.ok) {
      let user = await response.json();
      removeUserLine(user._id);
    }
  }

  async function downloadCurrentUser(id) {
    let result = await fetch('api/users/' + id, {
      method: 'GET',
      headers: {'Accept': 'application/json'}
    });
    if (result.ok) {
      let user = await result.json();
      inputId.value = user._id;
      inputName.value = user.name;
      inputAge.value = user.age;
    }
  }

  async function addUser(body){
    let response = await fetch('api/users', {
      method: 'POST',
      headers: {
        "Accept": "application/json",
        "Content-type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (response.ok) {
      let user = await response.json();
      addUserLine(user);
    }
  }

  async function changeUser(body){
    let request = await fetch('api/users/' + body.id, {
      method: 'PUT',
      headers: {'Accept': 'application/json', 'Content-type': 'application/json'},
      body: JSON.stringify(body)
    });
    if (request.ok) {
      let user = await request.json();
      let oldLine = document.querySelector('tr[id="' + user.id + '"]');
      let newLine = '\
                      <tr id="' + user.id + '">\
                        <td>' + user.id + '</td>\
                        <td>' + user.name + '</td>\
                        <td>' + user.age + '</td>\
                        <td>\
                            <button class="userForm__button" type="button" data-role="change"> Змінити </button>\
                            <button class="userForm__button" type="button" data-role="delete"> Видалити </button>\
                        </td>\
                      </tr>\
                    ';
      oldLine.insertAdjacentHTML('afterEnd', newLine);
      oldLine.remove();
      resetForm();
    }
  }

  function submitForm() {
    let id   = inputId.value   || 0,
        name = inputName.value || 0,
        age  = inputAge.value  || 0;

    if (!name || !age) {
      alert('заповніть форму!');
      return;
    }

    if (!id) {
      addUser({age: age, name: name});
      resetForm();
    } else {
      changeUser({id: id, age: age, name: name});
    }
  }

  function addUserLine(user) {
    let htmlString = '\
                      <tr id="' + user._id + '">\
                        <td>' + user._id + '</td>\
                        <td>' + user.name + '</td>\
                        <td>' + user.age + '</td>\
                        <td>\
                            <button class="userForm__button" type="button" data-role="change"> Змінити </button>\
                            <button class="userForm__button" type="button" data-role="delete"> Видалити </button>\
                        </td>\
                      </tr>\
                     ';

    document.querySelector('#clientsTable tbody').insertAdjacentHTML('beforeEnd', htmlString);
  }

  function removeUserLine(id){
    document.querySelector('tr[id="' + id + '"]').remove();
  }

  function resetForm() {
    let formInputs = form.querySelectorAll('input');
    formInputs.forEach(item => {
      item.value = '';
    });
  }
/* ↑↑↑ /functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////

// db.users.insertMany([
//   {name: "Василь", age: 12},
//   {name: "Степан", age: 25},
//   {name: "Микола", age: 12},
//   {name: "Петро", age: 59},
//   {name: "Клим", age: 36},
//   {name: "Юхим", age: 31},
//   {name: "Богдан", age: 15},
//   {name: "Михайло", age: 11},
//   {name: "Гнат", age: 47},
//   {name: "Тиміш", age: 14},
//   {name: "Юрій", age: 19},
//   {name: "Антін", age: 20}
// ]);