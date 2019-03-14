from keystoneclient.v3 import client

from log.log import logger
from plugin.base import BaseClient
from neutronclient.v2_0 import client as neu_client


class KeystoneClient(BaseClient):
    def __init__(self, username=None, password=None, project_name=None, token=None, admin=False):
        super().__init__(username, password, project_name, token, admin)
        self.keystone = client.Client(session=self.sess)
        self.neutron = neu_client.Client(session=self.sess)

    def create_project(self, name, domain):
        project = self.find_project(name)
        if project is None:
            return self.keystone.projects.create(name=name, domain=domain, description=None, enabled=True, parent=None)
        return project

    def delete_project(self, name):
        self.keystone.projects.delete(self.keystone.projects.find(name=name))

    def create_user(self, name, domain, project, password, email):
        user = self.find_user(name)
        if user is None:
            return self.keystone.users.create(name=name, domain=domain, project=project, password=password, email=email,
                                              description=None, enabled=True, parent=None)
        return user

    def delete_user(self, name):
        self.keystone.users.delete(self.keystone.users.find(name=name))

    def add_user_to_project(self, user, project):
        user_ops = None
        project_ops = None
        while user_ops is None:
            user_ops = self.find_user(user)
        while project_ops is None:
            project_ops = self.find_project(project)
        role = self.keystone.roles.find(name=self.ops.role_user)
        self.keystone.roles.grant(role, user=user_ops, project=project_ops)

    def find_project(self, project):
        try:
            return self.keystone.projects.find(name=project)
        except Exception as e:
            logger.info(e)
            return None

    def find_user(self, user):
        try:
            return self.keystone.users.find(name=user)
        except Exception as e:
            logger.info(e)
            return None

    def get_token(self):
        return self.sess.get_token(self.auth)

    def authenticate(self):
        try:
            return self.keystone.authenticate(**self.info)
        except Exception as e:
            logger.info(e)
            return None

    def create_network(self, network_name):
        body_sample = {'network': {'name': network_name,
                                   'admin_state_up': True}}
        net = self.neutron.create_network(body=body_sample)
        body_create_subnet = {'subnets': [{'name': network_name, 'cidr': '192.168.0.0/24', 'gateway_ip': None,
                                           'ip_version': 4, 'network_id': net['network']['id']}]}
        self.neutron.create_subnet(body=body_create_subnet)
        return net['network']['id']

    def show_network(self, network_id):
        return self.neutron.show_network(network_id)

    def show_subnet(self, subnet_id):
        return self.neutron.show_subnet(subnet_id)


def auth_user(username, password):
    cred = {
        'username': username,
        'password': password,
    }
    connect = KeystoneClient(**cred)
    if connect.authenticate():
        user_id = connect.keystone.user_id
        projects = connect.keystone.projects.list(user=user_id)
        projects = [p.name for p in projects]
        cred['project_name'] = projects[0]
        connect = KeystoneClient(**cred)
        return connect.get_token()
    return None


# def check_token(token):
#     connect = KeystoneClient(username=current_app.config['OPS_ADMIN'], password=current_app.config['OPS_PASSWORD'],
#                              project_name=current_app.config['OPS_PROJECT'])
#     try:
#         data = connect.keystone.tokens.validate(token['Token'])
#     except Exception as e:
#         logger.info(e)
#         return None
#     else:
#         return data.username

