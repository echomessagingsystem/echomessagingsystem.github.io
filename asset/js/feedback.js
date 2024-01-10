let token = '5658730618:AAGHo2wGfEJvZ5DZxw1MMpxKAw2_8PnXR_Q';
let chatId = '1221832086';
function showNotification(message, success) {
    var notification = document.getElementById('notification');
    notification.innerHTML = message;
    notification.classList.remove('d-none');
    if (success === true) {
      notification.classList.remove('alert-danger');
      notification.classList.add('alert-info');
    } else {
      notification.classList.remove('alert-info');
      notification.classList.add('alert-danger');
    }
    setTimeout(function () {
      notification.classList.add('d-none');
    }, 2000);
  }

  document.getElementById("submit").addEventListener("click", () => {
    const feedback = document.getElementById("feedback").value;
    if (feedback.trim() === "") {
      showNotification("Enter your Feedback", false);
    } else {
      const message = `✔️From Echo-Globe \n\nFeedBack: \n\t${feedback}`;
      const encodedMessage = encodeURIComponent(message);
      fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodedMessage}`)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (data.ok === true) {
            document.getElementById("feedback").value = "";
            showNotification("Feedback Sent Successfully", true);
          } else {
            showNotification("Feedback not Submitted Successfully.", false);
          }
        })
        .catch(error => {
          showNotification("Feedback not Submitted Successfully.", false);
        });
    }
  });




