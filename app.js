
let btn = document.querySelector(".btn");
let text = document.querySelector("span");
function reporty() {
    text.textContent = "Anyway Your Form Is Submitted"
}
btn.addEventListener('click', (e) => {
    e.preventDefault()
    // Grabbing the values inside the click event is correct!
    let input_name = document.querySelector(".txt").value;
    let input_email = document.querySelector("#email").value;
    let input_password = document.querySelector("#pin").value;
    let arr = [input_email,input_name,input_password];
    arr.forEach(a => {
        a.length >= 7 ? text.textContent = 'good' : text.textContent = 'not close to the required number';

    setTimeout(reporty,3000)
    
    console.log(a);    
    });
        
        
});