$(document).ready(function () {

    var country_state = ""

    // get data nations and states
    $.ajax({
        type: "GET",
        url: "/json-nations-states",
        success: data => {
            country_state = data
            var countries = data
            var element = ``
            countries.map(item => {
                element += `<option value=${item.country_code}>${item.country_name}</option>`
            })
            $('.crs-country').html(element)
            $('.crs-country').change(() => {
                var currentCountry = $('.crs-country').val()
                var region = countries.find(element => element.country_code === currentCountry)
                region = region.country_region
                var element = ``
                region.map(item => {
                    element += `<option value=${item.region_code}>${item.region_name}</option>`
                })
                $('#region').html(element)
            })

            // get data time zone
            $.ajax({
                type: "GET",
                url: "/timezone",
                success: data => {
                    var element = ``
                    data.map(item => {
                        element += `<option value=${item.value}>${item.text}</option>`
                    })
                    $('#timezone').html(element)
                }
            })


            $.ajax({
                type: "GET",
                url: "/data-user-json",
                success: data => {
                    var region = country_state.find(item => item.country_code === data.country)
                    $(`select[name=country] option[value=${data.country}]`).prop('selected', true);
                    region = region.country_region
                    var element = ``
                    region.map(item => {
                        element += `<option value=${item.region_code}>${item.region_name}</option>`
                    })
                    $('#region').html(element)
                    $('#region').val(data.region)
                    $('#timezone').val(data.timezone)
                    $('#address-register').val(data.address_register)
                    $('#lastname').val(data.lastname)
                    $('#firstname').val(data.firstname)
                    $('#email').val(data.email)
                    $('#phonenumber').val(data.phone)
                    $('#companyname').val(data.company)
                    $('#director').val(data.company)
                    $('#tax-id').val(data.tax_id)
                    $('#address1').val(data.address1)
                    $('#city').val(data.city)
                    $('#address2').val(data.address2)
                    $('#postcode').val(data.post_code)
                }
            })
        }
    })

    $("#keypairs").load('/sshkeysrow');

    $("#keypairs").on('click', '.del_ssh', function(){
        var id = $(this).data('id')
        var name = $(this).data('name')
        swal({
            imageUrl: '/static/images/spinner.gif',
            imageHeight: 120,
            imageAlt: 'wait',
            title: "Xin chờ ...",
            showConfirmButton: false
        });
        $.ajax({
            type: 'POST',
            url: '/sshkeysrow',
            data: {
                id: id,
                delete_sshkey: name,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
            },
            success: function(msg){
                var result = JSON.parse(JSON.stringify(msg));
                if(result.status == 'Failure'){
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
                        timer: 1000
                    });
                };
            }
        })
    })

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
                }else if(msg.length > 100) {
                    location.replace = "/"
                }else{
                    document.getElementById("close_modal_sshkey").click();
                    swal.close();
                    $("#add_ssh_key").load("/sshkeys");
                }
            }
        });
    });

    // Click update
    $('#btUpdate').on('click', (e) => {
        e.preventDefault()
        var region = $('#region').val()
        var timezone = $('#timezone').val()
        var addressRegister = $('#address-register').val()
        var lastname = $('#lastname').val()
        var firstname = $('#firstname').val()
        var email = $('#email').val()
        var phone = $('#phonenumber').val()
        var company_name = $('#companyname').val()
        var director = $('#director').val()
        var tax_id = $('#tax-id').val()
        var address1 = $('#address1').val()
        var city = $('#city').val()
        var address2 = $('#address2').val()
        var postcode = $('#postcode').val()
        var country = $('#crs-country').val()
        swal({
            imageUrl: '/static/images/spinner.gif',
            imageHeight: 120,
            imageAlt: 'wait',
            title: "Xin chờ ...",
            showConfirmButton: false
        });
        $.ajax({
            type: 'POST',
            url:'/post-data-user',
            data: {
                'region':region,
                'timezone':timezone,
                'lastname':lastname,
                'firstname':firstname,
                'email':email,
                'phone':phone,
                'company_name':company_name,
                'addressRegister': addressRegister,
                'director':director,
                'tax_id':tax_id,
                'address1':address1,
                'city':city,
                'address2':address2,
                'postcode':postcode,
                'country':country,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
            },
            success: function(msg){
                var result = JSON.parse(JSON.stringify(msg));
                if(result.status == 'False'){
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
                        timer: 1000
                    })
                };
            }
        })
    })

    // Click update
    $('#btChangePass').on('click', (e) => {
        e.preventDefault()
        var pass1 = $("#current_password").val();
        var pass2 = $("#new_password").val();
        var pass3 = $("#new_password2").val();

        if( pass1 == "" || pass2 == "" || pass3 == "" ){
            Swal.fire({
                type: 'error',
                title: 'Lỗi',
                text: 'Không được để trống trường nào',
            });
            return false;
        };

        if( pass2 != pass3){
            Swal.fire({
                type: 'error',
                title: 'Lỗi',
                text: 'Mật khẩu nhập lại không trùng khớp'
            });
            return false;
        };
        swal({
            imageUrl: '/static/images/spinner.gif',
            imageHeight: 120,
            imageAlt: 'wait',
            title: "Xin chờ ...",
            showConfirmButton: false
        });
        $.ajax({
            type: 'POST',
            url:'/post-data-user',
            data: {
                pass1: pass1,
                pass2: pass2,
                pass3: pass3,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
            },
            success: function(msg){
                var result = JSON.parse(JSON.stringify(msg));
                if(result.status == 'False'){
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
                        timer: 1000
                    }).then(() => {
                        location.replace(result.messages)
                    });
                };
            }
        })
    })
})