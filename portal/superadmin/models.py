from django.db import models
from django.contrib.auth.models import (
    BaseUserManager, AbstractBaseUser
)
from django.utils import timezone
from django_cryptography.fields import encrypt


class MyUserManager(BaseUserManager):
    def create_user(self, email, username, key, password):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
            username=username,
            key=key,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, key, password):
        """
        Creates and saves a superuser with the given email, date of
        birth and password.
        """
        user = self.create_user(
            email,
            password=password,
            username=username,
            key=key,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user


class MyUser(AbstractBaseUser):
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    lastname = models.CharField(max_length=100, blank=True)
    firstname = models.CharField(max_length=100, blank=True)
    username = models.CharField(max_length=100)
    key = models.CharField(max_length=100)
    is_active = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_adminkvm = models.BooleanField(default=False)
    is_trial = models.BooleanField(default=True)
    is_block = models.BooleanField(default=False)
    token_id = models.CharField(max_length=255, null=True)
    created = models.DateTimeField(null=True)
    money = models.CharField(max_length=100, default="0")
    phone = models.CharField(max_length=100, default='')
    company = models.TextField(max_length=200, blank=True)
    addressRegister = models.TextField(max_length=200, blank=True)
    director = models.TextField(max_length=200, blank=True)
    taxID = models.TextField(max_length=200, blank=True)
    address1 = models.TextField(max_length=200, blank=True)
    country = models.TextField(max_length=200, blank=True)
    city = models.TextField(max_length=200, blank=True)
    region = models.TextField(max_length=200, blank=True)
    timezone = models.CharField(max_length=100, default='0')
    address2 = models.TextField(max_length=200, blank=True)
    postCode = models.CharField(max_length=200, blank=True)

    objects = MyUserManager()

    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.email

    def check_trial(self):
        if self.is_trial and self.is_active:
            time = timezone.now() - self.created
            return time < timezone.timedelta(days=7)
        return False

    @property
    def fullname(self):
        return "%s %s" % (self.lastname, self.firstname)


class Server(models.Model):
    project = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    host = models.CharField(max_length=255, null=True)
    name = models.CharField(max_length=255)
    ip = models.CharField(max_length=255, null=True)
    ram = models.IntegerField()
    vcpus = models.IntegerField()
    disk = models.IntegerField()
    owner = models.ForeignKey('Myuser', models.CASCADE)
    created = models.CharField(max_length=255, null=True)
    i_d = models.CharField(max_length=255, null=True)
    data_center = models.CharField(max_length=50)
    os_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'serverVM'


class Sshkeys(models.Model):
    ops = models.ForeignKey('Ops', models.CASCADE)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey('Myuser', models.CASCADE)

    class Meta:
        db_table = 'sshkeys'


class Images(models.Model):
    ops = models.ForeignKey('Ops', models.CASCADE)
    name = models.CharField(max_length=255)
    os = models.CharField(max_length=255)
    i_d = models.CharField(max_length=255)

    class Meta:
        db_table = 'images'


class Snapshot(models.Model):
    ops = models.ForeignKey('Ops', models.CASCADE)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey('Myuser', models.CASCADE)
    i_d = models.CharField(max_length=255)

    class Meta:
        db_table = 'snapshot'


class Networks(models.Model):
    owner = models.ForeignKey('Myuser', models.CASCADE)
    name = models.CharField(max_length=255)
    subnets_associated = models.CharField(max_length=255)
    shared = models.IntegerField()
    external = models.IntegerField()
    status = models.CharField(max_length=100)
    admin_state_up = models.IntegerField()

    class Meta:
        db_table = 'client_networks'


class Oders(models.Model):
    service = models.CharField(max_length=255)
    server = models.CharField(max_length=255)
    price = models.CharField(max_length=255)
    status = models.IntegerField(default=0)
    owner = models.ForeignKey('Myuser', models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(null=True)
    pay_date = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if self.deadline is None:
            self.deadline = timezone.now() + timezone.timedelta(days=7)
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'oders'


class Ops(models.Model):
    name = models.CharField(max_length=255)
    ip = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    password = encrypt(models.CharField(max_length=50))
    project = models.CharField(max_length=255)
    userdomain = models.CharField(max_length=255)
    projectdomain = models.CharField(max_length=255)
    role_user = models.CharField(max_length=50)
    role_admin = models.CharField(max_length=50)
    disk_hdd = models.CharField(max_length=50, blank=True)
    disk_ssd = models.CharField(max_length=50, blank=True)
    net_provider = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'ops'


class Prices(models.Model):
    ram = models.IntegerField(default=50000)
    vcpus = models.IntegerField(default=60000)
    disk_hdd = models.IntegerField(default=3000)
    disk_ssd = models.IntegerField(default=5000)
