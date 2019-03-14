$(document).ready(function(){
    $("#update").click(function(){
        swal({
                imageUrl: '/static/images/spinner.gif',
                imageHeight: 120,
                imageAlt: 'wait',
                title: "Xin chờ ...",
                showConfirmButton: false
            });
        $.ajax({
            type: 'POST',
            url: location.href,
            data: {
                csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
            },
            success: function(msg){
                swal.close();
                var result = JSON.parse(JSON.stringify(msg));

                if(result.status == 'Fail'){
                    Swal.fire({
                        type: 'error',
                        title: 'Lỗi',
                        text: result.messages,
                    });
                }
                else{
                    Swal.fire({
                        type: 'success',
                        title: 'Thành công',
                        text: 'Xin chờ giây lát',
                        showConfirmButton: false,
                        timer: 1000
                    }).then(() => {
                        location.reload()
                    });
                };
            }

        })
    });

});