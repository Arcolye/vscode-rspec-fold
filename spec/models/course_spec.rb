require 'spec_helper'

describe Course do

	it "is valid with name, title, and website" do
		expect(build :course).to be_valid
	end
	it "is invalid without name" do
		expect(build :course, name: "").to have(1).error_on(:name)
	end
	it "is valid without title" do
		#recently changed because we merged title into name.
		#we will remove the title column soon
		expect(build :course, title: "").to have(0).error_on(:title)
	end
	it "is invalid without website" do
		expect(build :course, website: "").to have(1).error_on(:website)
	end

	it "doesn't display by default on user-facing site when disabled" do
		create(:course, disabled: true, name: "Course Handle")
		expect(Course.where(name: "Course Handle")).to be_empty
		expect(Course.unscoped.where(name: "Course Handle")).not_to be_empty
	end

	describe "string output" do
		let(:uni) { create(:university, nickname: "Madison") }

		it "gives 'course_name @ uni' string" do
			course = build(:course, university: uni, name: "MBw Basket Weaving")
			expect(course.name_at_uni).to eq("MBw Basket Weaving @ Madison")
		end
		it "ignores title column" do
			# delete this test after the title column is removed
			course = build(:course, university: uni, name: "MBw Basket Weaving", title: "BSc")
			expect(course.name_at_uni).to eq("MBw Basket Weaving @ Madison")
		end
	end

	it "displays the fee" do
		course = build(:course, fee: 4500)
		expect(course.fee_display).to eq "4500"
	end
	it "displays N/A when there's no fee" do
		course = build(:course, university: nil, fee: 0)
		expect(course.fee_display).to eq "N/A"
		course = build(:course, university: nil, fee: nil)
		expect(course.fee_display).to eq "N/A"
	end

	describe "search" do
		it "finds courses on course name"
		it "finds courses on university name"
		it "finds courses on city"
		it "ignores [ , & ' \" and ]"
	end

	it "gets assigned subjects automatically when created" do
		subject_medicine = create(:subject, name: "Medicine", keyword_list: "Surgery, Medicine, Biomedical, medical" )
		subject_agriculture = create(:subject, name: "Agriculture", keyword_list: "Agriculture, Agricultural, Horticulture, Viticulture, Rural Development, Farm" )
		course = create(:course, name: "MSc Alien Medicine")

		expect(course.subjects).to eq [subject_medicine]
	end

end
