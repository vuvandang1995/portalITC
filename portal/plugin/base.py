from keystoneauth1.identity import v3
from keystoneauth1 import session
from superadmin.models import Ops


class BaseClient:
    def __init__(self, username=None, password=None, project_name=None, token=None, admin=False):
        self.ops = Ops.objects.all()[0]
        if admin:
            self.info = {
                'auth_url': 'http://%s:5000/v3' % self.ops.ip,
                'username': self.ops.username,
                'password': self.ops.password,
                'project_domain_name': self.ops.projectdomain,
                'user_domain_name': self.ops.userdomain,
                'project_name': self.ops.project
            }
            self.auth = v3.Password(**self.info)
        elif token is None:
            self.info = {
                'auth_url': 'http://%s:5000/v3' % self.ops.ip,
                'username': username,
                'password': password,
                'project_domain_name': self.ops.projectdomain,
                'user_domain_name': self.ops.userdomain,
                'project_name': project_name
            }
            self.auth = v3.Password(**self.info)
        else:
            self.info = {
                'auth_url': 'http://%s:5000/v3' % self.ops.ip,
                'token': token,
                'project_name': project_name,
                'project_domain_name': self.ops.projectdomain,
                'reauthenticate': False
            }
            self.auth = v3.Token(**self.info)
        self.sess = session.Session(self.auth)
