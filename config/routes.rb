Rails.application.routes.draw do
  root 'home#welcome'
  get 'home/welcome'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
