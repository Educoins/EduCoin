# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu-13.04_64"
  #ubuntu-12.04_32
  #url https://cloud-images.ubuntu.com/vagrant/precise/current/precise-server-cloudimg-i386-vagrant-disk1.box
  config.vm.provision :shell, :inline => "sudo cp /vagrant/files/etc/hosts /etc/hosts"

  config.vm.define :ubuntu13 do |ubuntu13_config|
    ubuntu13_config.vm.host_name = "ubuntu13"
    ubuntu13_config.vm.network "private_network", ip:"192.168.59.2"
  end

  config.vm.define :ubuntu14 do |ubuntu14_config|
    ubuntu14_config.vm.host_name = "ubuntu14"
    ubuntu14_config.vm.network "private_network", ip:"192.168.59.3"
  end

  config.vm.define :ubuntu15 do |ubuntu15_config|
    ubuntu15_config.vm.host_name = "ubuntu15"
    ubuntu15_config.vm.network "private_network", ip:"192.168.59.4"
  end

  config.vm.define :ubuntu16 do |ubuntu16_config|
    ubuntu16_config.vm.host_name = "ubuntu16"
    ubuntu16_config.vm.network "private_network", ip:"192.168.59.5"
  end


  config.vm.define :ubuntu12_04 do |ubuntu12_04_config|
    ubuntu12_04_config.vm.box = "ubuntu-12.04_32"
    ubuntu12_04_config.vm.host_name = "ubuntu1204"
    ubuntu12_04_config.vm.network "private_network", ip:"192.168.59.10"
  end

  config.vm.define :ubuntu13_10 do |ubuntu13_10_config|
    ubuntu13_10_config.vm.box = "ubuntu-13.10_32"
    ubuntu13_10_config.vm.host_name = "ubuntu1310"
    ubuntu13_10_config.vm.network "private_network", ip:"192.168.59.11"
  end

end
