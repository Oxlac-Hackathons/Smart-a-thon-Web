const form = document.querySelector("form");
const urlInput = document.querySelector('input[name="urlInput"]');
const textInput = document.querySelector('textarea[name="textInput"]');
const sentenceLimit = document.querySelector('input[name="sentences"]');
const buttonLoader = document.getElementById('summBtn');

if (sentenceLimit.value === "" ){
  sentenceLimit.value = 5;
}

urlInput.addEventListener("input", () => {
  textInput.disabled = urlInput.value !== "";
});

textInput.addEventListener("input", () => {
  urlInput.disabled = textInput.value !== "";
});

form.addEventListener("submit", (event) => {
  buttonLoader.innerHTML = '<span class="button-loader"></span>';
  event.preventDefault(); // Prevent the default form submission behavior

  // Access the form inputs
  const urlValue = urlInput.value;
  const textValue = textInput.value;

  if (urlValue) {
    console.log("URL Input:", urlValue);

    const formdata = new FormData();
    formdata.append("key", "3075fa71d1f660032c1e493b74cc0fec");
    formdata.append("url", urlValue);
    formdata.append("sentences", sentenceLimit.value);

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };
    
    const response = fetch(
      "https://api.meaningcloud.com/summarization-1.0",
      requestOptions
    )
      .then((response) => ({
        status: response.status,
        body: response.json(),
      }))
      .then(({ status, body }) => {
        return body.then((data) => ({
          status: status,
          summary: data.summary,
        }));
      })
      .then(({ status, summary }) => {
        console.log(status, summary);
        document.getElementById("output").innerHTML = summary;
      })
      .catch((error) => console.log("error", error));
      buttonLoader.innerHTML = 'Summarise';
  } else if (textValue) {
    console.log("Text Input:", textValue);

    const formdata = new FormData();
    formdata.append("key", "3075fa71d1f660032c1e493b74cc0fec");
    formdata.append("txt", textValue);
    formdata.append("sentences", sentenceLimit.value);

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    const response = fetch(
      "https://api.meaningcloud.com/summarization-1.0",
      requestOptions
    )
      .then((response) => ({
        status: response.status,
        body: response.json(),
      }))
      .then(({ status, body }) => {
        return body.then((data) => ({
          status: status,
          summary: data.summary,
        }));
      })
      .then(({ status, summary }) => {
        console.log(status, summary);
        document.getElementById("output").innerHTML = summary;
        document.getElementById("output").scrollIntoView({
          behavior: 'smooth'
        });
      })
      .catch((error) => console.log("error", error));
  }
  // Reset the form
  form.reset();
});
