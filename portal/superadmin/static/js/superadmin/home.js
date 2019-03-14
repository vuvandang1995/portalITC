$(document).ready(function(){

    $("#net_provider").on('click', '.del', function(){
        if($("#net_provider .row").length < 2){
            Swal.fire({
                type: 'error',
                title: 'Lỗi',
                text: 'Không được xóa hết'
            })
            return false;
        }
        $(this).parent().parent().remove();
    });

    $("#net_provider").on('click', '.add', function(){
        var html = `
        <div class="row">
            <div class="col-md-9">
                <input type="text" name="net_provider" class="form-control ops_data" data-last="">
            </div>
            <div class="col-md-3">
                <button type="button" class="btn btn-danger del">
                    Xóa
                </button>
                <button type="button" class="btn btn-success add">
                    Thêm
                </button>
            </div>
        </div>
        `
        $("#net_provider").append(html);
    });

    $("#edit").click(function(){
        $(".ops_data").each(function(){
            $(this).prop('disabled', false);
        });
        $(".del").each(function(){
            $(this).show();
        })
        $(".add").each(function(){
            $(this).show();
        })
        $("#save").show();
        $("#cancel").show();
        $("#edit").hide();
    });

    $("#cancel").click(function(){
        $(".ops_data").each(function(){
            $(this).prop('disabled', true);
            $(this).val($(this).data('last'));
        });
        $(".del").each(function(){
            $(this).hide();
        })
        $(".add").each(function(){
            $(this).hide();
        })

        var html = ''
        for(var net of net_provider){
            html+=`
            <div class="row">
                <div class="col-md-9">
                    <input type="text" name="net_provider" class="form-control ops_data" value=${net} disabled  data-last=${net}>
                </div>
                <div class="col-md-3">
                    <button type="button" class="btn btn-danger del" style="display: none;">
                        Xóa
                    </button>
                    <button type="button" class="btn btn-success add" style="display: none;">
                        Thêm
                    </button>
                </div>
            </div>
            `
        }
        $("#net_provider").html(html);

        $("#save").hide();
        $("#cancel").hide();
        $("#edit").show();
    });

    $("#save").click(function(){
        var data = {
            csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
        };
        var check = true;
        $(".ops_data").each(function(){
            var value = $(this).val();
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
            if(name=='net_provider'){
                try{
                    data[name].push(value);
                }catch{
                    data[name] = [value];
                }
            }else{
                data[name] = value;
            }
        });
        if (check){
            data['net_provider'] = JSON.stringify(data['net_provider']);
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