$(document).ready(function () {
    $("body").on('click', '#sshkey_submit', function(){
        var token = $("input[name=csrfmiddlewaretoken]").val();
        var sshkeyname = $("input[name=sshkeyname]").val();
        swal({
            imageUrl: '/static/images/spinner.gif',
            imageHeight: 120,
            imageAlt: 'wait',
            title: "Xin chờ...",
            showConfirmButton: false
        });
        $.ajax({
            type:'POST',
            url:'/sshkeysa',
            data: {'sshkeyname':sshkeyname, 'csrfmiddlewaretoken':token},
            success: function(msg){
                if ((msg == 'Đã có lỗi xảy ra!') || (msg == 'Tên ssh key đã tồn tại!')){
                    swal({
                        type: 'error',
                        title: msg,
                    });
                }
                else if(msg.length > 100) {
                    location.replace = "/"
                }
                else{
                    document.getElementById("close_modal_sshkey").click();
                    swal.close();
                    $("#add_ssh_key").load("/sshkeysa");
                }
            }
        });
    });

    $("#create_vm").click(function(){
        var token = $("input[name=csrfmiddlewaretoken]").val();
        var svname = $("input[name=svname]").val();
        if (svname == ''){
            swal({
                type: 'error',
                title: 'Lỗi',
                text: 'VM Hostname không được để trống'
            });
            return false;
        }
        if(!$("input[name=dong_y]").is(":checked")){
            swal({
                type: 'error',
                title: 'Lỗi',
                text: 'Chưa đồng ý với điều khoản và chính sách bảo mật'
            });
            return false;
        }
        var data_center = $(".one-location.text-center.selected").data('location');
        var vcpus = parseInt($('#cpu-slider').parent().find('.irs-single').first().text().split(" ")[0]);
        var ram = parseInt($('#ram-slider').parent().find('.irs-single').first().text().split(" ")[0]);
        var disk = parseInt($('#ssd-slider').parent().find('.irs-single').first().text().split(" ")[0]);
        if(user_trial=="True"){
            if(ram>1 || vcpus>1 || disk>10){
                swal({
                    type: 'error',
                    title: 'Lỗi',
                    text: 'Tài khoản dùng thử chỉ được tạo máy chủ với cấu hình tối thiểu'
                });
                return false;
            }
            if(user_server > 0){
                swal({
                    type: 'error',
                    title: 'Lỗi',
                    text: 'Tài khoản dùng thử chỉ được tạo 1 máy chủ'
                });
                return false;
            }
        }else{
            var price = parseInt($(".total-price-with-vat").text());
            if(price > user_money){
                swal({
                    type: 'error',
                    title: 'Lỗi',
                    text: 'Không đủ tiền'
                });
                return false;
            }
        }

        var type_disk = 'hdd';

//        var data_disk = [];
//        $(".template_data_disk").each(function(){
//            data_disk.push($(this).find('.irs-single').first().text().split(" ")[0]);
//        });

        var image;
        if($("#oses .active").attr('href') == '#os-hdh'){
            $('.selected-os-hdh').each(function(){
                if($(this).parent().attr('class')=='btn one-dis-toggle'){
                    image = $(this).text();
                    return false;
                }
            });
            ck = false;
            $(".os-select").each(function(){
                if($(this).text() == image){
                    image = $(this).data('id')
                    ck = true;
                    return false;
                }
            })
            if(!ck){
                swal({
                    type: 'error',
                    title: 'Lỗi',
                    text: 'Chưa chọn hệ điều hành'
                });
                return false;
            }
        }else{
            image = $("#ls_snapshot option:selected").val();
        }
        var private_network = '0';
        if($('input[name=private_network]').is(":checked")){
            private_network = '1'
        }

        var sshkey = $("#add_ssh_key option:selected").text();

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
                csrfmiddlewaretoken:token,
                svname: svname,
                data_center: data_center,
                vcpus: vcpus,
                ram: ram,
                disk: disk,
                image: image,
                type_disk: type_disk,
                private_network: private_network,
                sshkey: sshkey
            },
            success: function(data){
                if(data.length > 100) {
                    location.replace = "/"
                }
                var msg = JSON.parse(JSON.stringify(data));
                if (msg.status == 'Failure'){
                    swal({
                        type: 'error',
                        title: msg.message,
                    });
                }
                else{
                    setTimeout(function(){
                        swal.close();
                        opsSocket.send(JSON.stringify({
                            'message' : msg.message,
                        }));
                    }, 1000);
                }
            }
        });
    });
});