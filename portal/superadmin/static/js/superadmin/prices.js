$(document).ready(function(){
    $("#edit").click(function(){
        $(".price_data").each(function(){
            $(this).prop('disabled', false);
        });
        $("#save").show();
        $("#cancel").show();
        $("#edit").hide();
    });

    $("#cancel").click(function(){
        $(".price_data").each(function(){
            $(this).prop('disabled', true);
            $(this).val($(this).data('last'));
        });

        $("#save").hide();
        $("#cancel").hide();
        $("#edit").show();
    });

    $("#save").click(function(){
        var data = {
            csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
        };
        var check = true;
        $(".price_data").each(function(){
            try{
                var value = parseInt($(this).val());
            }catch{
                Swal.fire({
                    type: 'error',
                    title: 'Lỗi',
                    text: 'Hãy nhập số'
                })
                check = false;
                return false;
            }
            var name = $(this).attr('name');
            if( value==''){
                Swal.fire({
                    type: 'error',
                    title: 'Lỗi',
                    text: 'Không được để trống'
                })
                check = false;
                return false;
            }
            data[name] = value;
        });
        if (check){
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
                data: data,
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
                            showConfirmButton: false,
                            timer: 2000
                        }).then(() => {
                            location.reload();
                        });
                    };
                }

            })
        }
    });


});