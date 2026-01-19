require 'spec_helper'

feature "Sign In" do
	before(:each) do
		reset_sent_emails
		Capybara.raise_server_errors = false
	end
	let(:user) { create :user }

	scenario "successful sign in via email when not signed in" do
		sign_in_with_email user

		expect(page).to have_content 'Welcome'
		expect(page).to have_content user.name
	end
	scenario "successful sign in via Facebook" do
		sign_in_with_facebook(user)

		expect(page).not_to have_content 'Welcome to GoToStudy'
		expect(page).to have_content user.name
		expect(sent_emails).to be_empty #don't sent welcome email on facebook sign in
	end
	scenario "can't sign in when already signed in" do
		sign_in_with_email user

		visit new_user_registration_path
		expect(page).to have_content 'already signed in'
		expect(current_path).to eq root_path
	end
	scenario "can't sign in with wrong password" do
		user.password += 'oops'
		sign_in_with_email user

		expect(page).to have_content "Invalid email or password"
		expect(page).not_to have_content user.name
		# expect(current_path).to eq new_user_registration_path
	end
end

feature "Sign out" do
	scenario "when click sign out" do
		user = create :user
		sign_in_with_email user

		click_link user.name
		click_link "Sign Out"

		expect(current_path).to eq root_path
		expect(page).to have_content 'Signed out'
	end
end

feature "Join" do
	before(:each) { reset_sent_emails }

	scenario "successful new user registration with valid inputs", :driver => :webkit do
		user = build :user

		visit new_user_registration_path
		within '#join' do
			fill_in 'Name', with: user.name
			fill_in 'Email', with: user.email
			fill_in 'Password', with: 'password'
			fill_in 'Password Again', with: 'password'
		end

		old_user_count = User.count
		click_button "Join"

		# save_and_open_page
		# expect{ click_button "Join" }.to change{ User.count }.by(1)
		# expect "it to send a welcome mail"

		expect(page).to have_content 'Welcome to GoToStudy'
		expect(sent_emails).not_to be_empty
		expect(sent_emails.last.to).to include(user.email)

		# expect(page).to have_content user.name
		new_user_count = User.count
		expect(new_user_count).to eq(old_user_count + 1)
	end

	scenario "invalid input" do
		visit new_user_registration_path
		within '#join' do
			#leave Name blank...invalid
			fill_in 'Email', with: 'name@email.com'
			fill_in 'Password', with: 'password'
			fill_in 'Password Again', with: 'password'
		end

		expect{ click_button "Join" }.not_to change{ User.count }
		expect(sent_emails).to be_empty
		# expect(current_path).to eq new_user_registration_path
		expect(page).to have_content "problems"
	end

	scenario "via Facebook" do
		user = build :user

		sign_in_with_facebook(user)

		expect(sent_emails.last.to).to include(user.email)
		expect(page).to have_content 'Welcome to GoToStudy'
		expect(page).to have_content user.name
	end

end

feature "Reset Password" do
	# let(:user) { create :user }

	scenario "request reset password link via email" do
		user = create :user
		visit new_user_registration_path
		click_link 'password'
		fill_in 'Email', with: user.email
		click_button 'Send'
		expect(current_path).to include('sign_in')

		expect(sent_emails.last.to).to include(user.email)
		expect(sent_emails.last.subject).to include('Reset password instructions')

		expect(page).to have_content 'You will receive'
	end

	scenario "reset password" do
		user = create :user
		user.send_reset_password_instructions
		visit "/students/password/edit?reset_password_token=#{user.reload.reset_password_token}"
		expect(page).to have_content 'Change your password'

		fill_in 'New password', with: "newpassword"
		fill_in 'Confirm your new password', with: "newpassword"
		click_button 'password'
		expect(page).to have_content "Your password was changed successfully"
	end
end

feature "Edit User Info" do
	let(:user) { create :user }

	scenario "Update name without password change" do
		sign_in_with_email user
		visit edit_user_registration_path
		fill_in 'Name', with: 'newusername'
		click_button 'Save'
		expect(page).to have_content 'We saved your profile updates'
		expect(user.reload.name).to eq 'newusername'
	end
end



feature "Referrals" do
	let(:referral) { create :user, referrer_id: referrer.id }

	scenario "in user's profile - referral WITHOUT review", :driver => :webkit do
		referral = create :user, referrer_id: referrer.id
		#referral doesn't create a review

		sign_in_with_email referrer
		visit user_path(referrer, locale: nil)
		save_and_open_screenshot

		# it "shows the user's referrals"
			expect(page).to have_content "Your Referrals"
			expect(page).to have_content referral.name
		# it "shows the user's referral score"
			expect(page).to have_content "0 referral points"
	end

	scenario "in user's profile - referral WITH review" do
		referral = create :user, referrer_id: referrer.id
		create :unconfirmed_review, user_id: referral.id

		sign_in_with_email referrer
		visit user_path(referrer, locale: nil)
		save_and_open_page
		# it "shows the user's referrals"
			expect(page).to have_content "Your Referrals"
			expect(page).to have_content referral.name
		# it "shows the user's referral score"
			expect(page).to have_content "5 referral points"
	end
end
