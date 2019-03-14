$(document).ready(function(){
    $("#change").click(function(){
        var pass1 = $("input[name=pass1]").val();
        var pass2 = $("input[name=pass2]").val();
        var pass3 = $("input[name=pass3]").val();

        if( pass1=='' || pass2=='' || pass3==''){
            Swal.fire({
                type: 'error',
                title: 'Lỗi',
                text: 'Không được để trống'
            })
            return false;
        }

        if(pass2!=pass3){
            Swal.fire({
                type: 'error',
                title: 'Lỗi',
                text: 'Mật khẩu nhập lại không khớp'
            })
            return false;
        }
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
                pass1: pass1,
                pass2: pass2
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
                        text: 'Hãy đăng nhập lại',
                        showConfirmButton: false,
                        timer: 2000
                    }).then(() => {
                        location.replace(result.messages)
                    });
                };
            }

        })
    })
});