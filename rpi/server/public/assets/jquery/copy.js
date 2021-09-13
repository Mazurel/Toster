let copy = function(obj){
    let content = $(obj).text().trim();
    console.log(content)
    $placeholder = $("<input>").attr("id", "placeholder").val(content).appendTo('body').select();    
    document.execCommand("copy");
    $placeholder.remove();
    //---------------change tooltip message-------------- 
    $(obj).attr("data-tooltip", "Copied!");
    $(obj).on("mouseout", function(){
        setTimeout( function(){
        $(obj).attr("data-tooltip", "Click to copy.")
    }, 100)
});
}
