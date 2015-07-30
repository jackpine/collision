Rails.application.routes.draw do
  namespace 'api' do
    namespace 'v1' do
      resources :incidents, only: [:index], defaults: { format: :json } do
        collection do
          get :counts, format: :json
        end
      end
    end
  end
end
