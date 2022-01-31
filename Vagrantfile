# -*- mode: ruby -*-
# vi: set ft=ruby :

vms = {
  'api-auth': {
    :ip => '192.168.56.127',
    :memory => '512',
    :autostart => true,
    :name => 'api-auth-development',
    :synced_folders =>
      [
        {
          :host => ".",
          :guest => "/opt/apps/api-auth/current"
        }
      ],
    :services_to_start =>
      [
        "api-auth",
      ]
  }
}

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
    ansible.inventory_path = "inventories/development"

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
  end

  vms.each_pair do |key, vm|
    autostart = vm[:autostart]
    config.vm.define key, autostart: autostart do |configvm|

      configvm.vm.network 'private_network', ip: vm[:ip]

      configvm.vm.provider 'virtualbox' do |vb|
        vb.memory = vm[:memory] || '512'
        vb.name = vm[:name]
      end

      vm[:synced_folders].each do |folders|
        configvm.vm.synced_folder folders[:host], folders[:guest], type: "nfs", create: true, nfs_version: "4"
      end
      configvm.vm.synced_folder ".", "/vagrant", disabled: true

      # We need to start the services here as the first start failed because it
      # was triggered before the shared folder are mounted
      vm[:services_to_start].each do |service|
        configvm.trigger.after :up do |trigger|
          trigger.info = "Starting #{service}..."
          # this command will fail on first installation since the service is not configured yet
          # we ignore error for smoother installation
          trigger.run_remote = {inline: "sudo systemctl start #{service} || echo 'if it is your first installation ignore the error above'"}
        end
      end
    end
  end
end
