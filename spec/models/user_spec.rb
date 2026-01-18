# frozen_string_literal: true

RSpec.describe User do

  describe '#valid?' do
    it 'returns true when email is present' do
      user = User.new(email: 'test@example.com')
      expect(user.valid?).to be true
    end

    it 'returns false when email is blank' do
      user = User.new(email: '')
      expect(user.valid?).to be false
    end

    it 'returns false when email format is invalid' do
      user = User.new(email: 'not-an-email')
      expect(user.valid?).to be false
    end
  end

  describe '#full_name' do
    context 'when both first and last name are present' do
      it 'returns the combined name' do
        user = User.new(first_name: 'John', last_name: 'Doe')
        expect(user.full_name).to eq('John Doe')
      end
    end

    context 'when only first name is present' do
      it 'returns just the first name' do
        user = User.new(first_name: 'John', last_name: nil)
        expect(user.full_name).to eq('John')
      end
    end

    context 'when neither name is present' do
      specify 'returns an empty string' do
        user = User.new(first_name: nil, last_name: nil)
        expect(user.full_name).to eq('')
      end
    end

    context 'when last name is present' do
      it 'returns the last name' do
        user = User.new(first_name: nil, last_name: 'Doe')
        expect(user.full_name).to eq('Doe')
      end
    end
  end

  describe '#admin?' do
    it 'returns true when role is admin' do
      user = User.new(role: 'admin')
      expect(user.admin?).to be true
    end

    it 'returns false when role is user' do
      user = User.new(role: 'user')
      expect(user.admin?).to be false
    end

    it 'returns false when role is nil' do
      user = User.new(role: nil)
      expect(user.admin?).to be false
    end
  end

  describe '#authenticate' do
    let(:user) { User.new(password: 'secret123') }

    it 'returns true with correct password' do
      expect(user.authenticate('secret123')).to be true
    end

    it 'returns false with incorrect password' do
      expect(user.authenticate('wrong')).to be false
    end

    specify 'returns false with empty password' do
      expect(user.authenticate('')).to be false
    end
  end
end
