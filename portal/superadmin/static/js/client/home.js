$(document).ready(function () {
    $('#maintable').load(location.href + "_data");

    $("body").on('click', '.console', function(){
        var url = $(this).attr('id');
        window.open(url);
    });

    $("#snapshot").on('show.bs.modal', function(event){
        var button = $(event.relatedTarget);
        $("input[name=svip]").val(button.attr('id').split('_')[1]);
        $("input[name=snapshotname]").val('');
    });

    $("#sshkey").on('show.bs.modal', function(event){
        var button = $(event.relatedTarget);
        $("input[name=svip]").val(button.attr('id').split('_')[1]);
        $("input[name=sshkeyname]").val('');
    });

//    $("#backup").on('show.bs.modal', function(event){
//        $("input[name=backupname]").val('');
//    });
    $("body").on('click', '#resetpass_submit', function(){
        var pass = $("input[name=resetpass]").val();
        var pass2 = $("input[name=password2]").val();
        var token = $("input[name=csrfmiddlewaretoken]").val();
        var id = $("input[name=svip]").val();
        if (pass == pass2){
            swal({
                imageUrl: '/static/images/spinner.gif',
                imageHeight: 120,
                imageAlt: 'wait',
                title: "Xin chờ ...",
                showConfirmButton: false
            });
            $.ajax({
                type:'POST',
                url:location.href,
                data: {'resetpass':id, 'csrfmiddlewaretoken':token, 'pass': pass},
                success: function(msg){
                    if (msg == 'Đã có lỗi xảy ra!'){
                        swal({
                            type: 'error',
                            title: msg,
                        });
                    }else{
                        document.getElementById("close_modal_resetpass").click();
                        swal.close();
                    }
                }
            });
        }else{
            swal({
                type: 'warning',
                title: "Mat khau khong trung khop",
            });
        }
    });

    $("body").on('click', '#snapshot_submit', function(){
        var id = $("input[name=svip]").val();
        var svname = $(this).attr('name');
        var snapshotname = $("input[name=snapshotname]").val();
        var token = $("input[name=csrfmiddlewaretoken]").val();
            swal({
                    imageUrl: '/static/images/spinner.gif',
                    imageHeight: 120,
                    imageAlt: 'wait',
                    title: "Xin chờ ...",
                    showConfirmButton: false
                });
        $.ajax({
            type:'POST',
            url:location.href,
            data: {'snapshot':id, 'csrfmiddlewaretoken':token, 'svname': svname, 'snapshotname': snapshotname},
            success: function(msg){
                if (msg == 'Đã có lỗi xảy ra!'){
                    swal({
                        type: 'error',
                        title: msg,
                    });
                }else{
                    document.getElementById("close_modal_snapshot").click();
                    swal.close();
                    $("body .snapshot_select").load(location.href + " .snapshot_select");
                }
            }
        });
    });

//    $("body").on('click', '#backup_submit', function(){
//        var id = $(this).attr('id').split('_')[1];
//        var svname = $(this).attr('name');
//        var backupname = $("input[name=backupname]").val();
//        var backup_type = document.getElementById("mySelect_backup_type").value;
//        var rotation = $("input[name=rotation]").val();
//        var token = $("input[name=csrfmiddlewaretoken]").val();
//            swal({
//                    imageUrl: '/static/images/spinner.gif',
//                    imageHeight: 120,
//                    imageAlt: 'wait',
//                    title: "Xin chờ ...",
//                    showConfirmButton: false
//                });
//        $.ajax({
//            type:'POST',
//            url:location.href,
//            data: {'backup':id, 'csrfmiddlewaretoken':token, 'svname': svname, 'backupname': backupname, 'backup_type': backup_type, 'rotation': rotation},
//            success: function(msg){
//                if (msg == 'Đã có lỗi xảy ra!'){
//                    swal({
//                        type: 'error',
//                        title: msg,
//                    });
//                }else{
//                    document.getElementById("close_modal_backup").click();
//                    swal.close();
//                }
//            }
//        });
//    });

    $("body").on('click', '#sshkey_submit', function(){
        var sshkeyname = $("input[name=sshkeyname]").val();
        var token = $("input[name=csrfmiddlewaretoken]").val();
        swal({
            imageUrl: '/static/images/spinner.gif',
            imageHeight: 120,
            imageAlt: 'wait',
            title: "Xin chờ ...",
            showConfirmButton: false
        });
        $.ajax({
            type:'POST',
            url:location.href,
            data: {'sshkeyname':sshkeyname, 'csrfmiddlewaretoken':token},
            success: function(msg){
                if ((msg == 'Đã có lỗi xảy ra!') || (msg == 'Tên ssh key đã tồn tại!')){
                    swal({
                        type: 'error',
                        title: msg,
                    });
                }else{
                    document.getElementById("close_modal_sshkey").click();
                    swal.close();
                    $("body .sshkey_select").load(location.href + " .sshkey_select");
                }
            }
        });
    });



    $("body").on('click', '.control', function(){
        var id = $(this).attr('id').split('_')[1];
        var action = $(this).attr('id').split('_')[0];
        var svname = $(this).attr('name');
        var token = $("input[name=csrfmiddlewaretoken]").val();
        if(action != 'resetpas' && action != 'snapshot' && action != 'backup' && action != 'sshkey'){
            swal({
                title: 'Bạn có chắc chắn ? ',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Có',
                cancelButtonText: 'Không'
            }).then(function(result){
                if(result.value){
                    if (action == 'del'){
                        swal({
                            imageUrl: '/static/images/spinner.gif',
                            imageHeight: 120,
                            imageAlt: 'wait',
                            title: "Xin chờ ...",
                            showConfirmButton: false
                        });
                        $.ajax({
                            type:'POST',
                            url:location.href,
                            data: {'delete':id, 'csrfmiddlewaretoken':token, 'svname': svname},
                            success: function(msg){
                                if (msg == 'Đã có lỗi xảy ra!'){
                                    swal({
                                        type: 'error',
                                        title: msg,
                                    });
                                }else{
                                    // swal.close();
                                    // opsSocket.send(JSON.stringify({
                                    //     'message' : msg,
                                    // }));
                                    setTimeout(function(){
                                        $('#maintable').load(location.href + "_data");
                                        swal.close();
                                    }, 3000);
                                }
                            }
                        });
                    }else if (action == 'start'){
                        swal({
                            imageUrl: '/static/images/spinner.gif',
                            imageHeight: 120,
                            imageAlt: 'wait',
                            title: "Xin chờ ...",
                            showConfirmButton: false
                        });
                        $.ajax({
                            type:'POST',
                            url:location.href,
                            data: {'start':id, 'csrfmiddlewaretoken':token, 'svname': svname},
                            success: function(msg){
                                if (msg == 'Đã có lỗi xảy ra!'){
                                    swal({
                                        type: 'error',
                                        title: msg,
                                    });
                                }else{
                                    setTimeout(function(){
                                        $('#maintable').load(location.href + "_data");
                                        swal.close();
                                    }, 4000);
                                }
                            }
                        });
                    }else if (action == 'reboot'){
                        swal({
                            imageUrl: '/static/images/spinner.gif',
                            imageHeight: 120,
                            imageAlt: 'wait',
                            title: "Xin chờ ...",
                            showConfirmButton: false
                        });
                        $.ajax({
                            type:'POST',
                            url:location.href,
                            data: {'reboot':id, 'csrfmiddlewaretoken':token, 'svname': svname},
                            success: function(msg){
                                if (msg == 'Đã có lỗi xảy ra!'){
                                    swal({
                                        type: 'error',
                                        title: msg,
                                    });
                                }else{
                                    setTimeout(function(){
                                        $('#maintable').load(location.href + "_data");
                                        swal.close();
                                    }, 4000);
                                }
                            }
                        });
                    }else if (action == 'hardreboot'){
                        swal({
                            imageUrl: '/static/images/spinner.gif',
                            imageHeight: 120,
                            imageAlt: 'wait',
                            title: "Xin chờ ...",
                            showConfirmButton: false
                        });
                        $.ajax({
                            type:'POST',
                            url:location.href,
                            data: {'hardreboot':id, 'csrfmiddlewaretoken':token},
                            success: function(msg){
                                if (msg == 'Đã có lỗi xảy ra!'){
                                    swal({
                                        type: 'error',
                                        title: msg,
                                    });
                                }else{
                                    setTimeout(function(){
                                        $('#maintable').load(location.href + "_data");
                                        swal.close();
                                    }, 4000);
                                }
                            }
                        });
                    }else if (action == 'stop'){
                        swal({
                            imageUrl: '/static/images/spinner.gif',
                            imageHeight: 120,
                            imageAlt: 'wait',
                            title: "Xin chờ ...",
                            showConfirmButton: false
                        });
                        $.ajax({
                            type:'POST',
                            url:location.href,
                            data: {'stop':id, 'csrfmiddlewaretoken':token, 'svname': svname},
                            success: function(msg){
                                if (msg == 'Đã có lỗi xảy ra!'){
                                    swal({
                                        type: 'error',
                                        title: msg,
                                    });
                                }else{
                                    setTimeout(function(){
                                        $('#maintable').load(location.href + "_data");
                                        swal.close();
                                    }, 4000);
                                }
                            }
                        });
                    }
                }
            })


        }
    });
//    function numberWithCommas(x) {
//        return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//    }
//
//    var money = $('.money').text().split(' VND')[0];
//    money = numberWithCommas(money);
//    $('.money').children().text(money + ' VND');
//
//    $("#mySelect_image").select2({
//        templateResult: formatState
//    });
//
//    $("#mySelect").select2({
//        templateResult: formatState
//    });
//
//    function formatState (state) {
//        if (!state.id) { return state.text; }
//        var $state = $(
//        '<span>' + state.text + '</span>'
//        );
//        return $state;
//    }

})
