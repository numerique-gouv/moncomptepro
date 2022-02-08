# -*- mode: ruby -*-
# vi: set ft=ruby :

ssh_pubkey = File.read(File.join(Dir.home, '.ssh', 'id_rsa.pub')).chomp

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-20.04"
  config.vm.synced_folder ".", "/vagrant", disabled: true

  config.vm.provision 'shell', inline: <<-SHELL
    sudo mkdir -p /home/vagrant/.ssh -m 700
    sudo echo '#{ssh_pubkey}' >> /home/vagrant/.ssh/authorized_keys
  SHELL

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "configure.yml"
    ansible.inventory_path = "../api-auth-secrets/development"

    roles_file = 'requirements.yml'

    if File.exist?(roles_file) && !Psych.load_file(roles_file).equal?(nil)
      ansible.galaxy_role_file = roles_file
      ansible.galaxy_roles_path = 'ansible_modules'
      ansible.galaxy_command = 'ansible-galaxy install -r %{role_file} --roles-path=%{roles_path}'
    end
  end

  config.ssh.insert_key = false

  config.vm.provider "virtualbox" do |v|
    v.cpus = 1
    v.gui = false
    v.memory = 512
    v.name = "api-auth-development"
  end

  config.vm.network 'private_network', ip: '192.168.56.127'

  config.vm.synced_folder ".", "/vagrant", disabled: true
  config.vm.synced_folder ".", "/opt/apps/api-auth/current", type: "nfs", create: true, nfs_version: "4"

  config.trigger.after :up do |trigger|
    trigger.info = "Starting api-auth..."
    # this command will fail on first installation since the service is not configured yet
    # we ignore error for smoother installation
    trigger.run_remote = {inline: "sudo systemctl start api-auth || echo 'if it is your first installation ignore the error above'"}
  end
end
