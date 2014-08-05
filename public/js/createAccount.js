function validateForm(){
    var form = $('form#account-form')[0];
    console.dir(form);
    console.dir(form.elements);
    console.dir(form.elements.password);
    console.log("hi");
    if(form.elements.password.val() != form.elements.password2.val()){
        return false;
    }
    return true;
}