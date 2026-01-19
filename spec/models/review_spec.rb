require 'spec_helper'

describe Review do

  it_behaves_like 'thankable'

	# VALIDATIONS ##################

	context "without course_id" do
		it "is valid with a long body, and unconfirmed course fields" do # comment ruins the folding regex?
			expect(build(:unconfirmed_review)).to be_valid
		end

	  it "is invalid without unconfirmed course fields" do
	  	review = build(:unconfirmed_review,
	  		unconfirmed_course_name: nil,
	  		unconfirmed_university_name: nil,
	  		unconfirmed_level: nil
	  	)
	  	expect(review).to have(1).errors_on(:unconfirmed_course_name)
	  	expect(review).to have(1).errors_on(:unconfirmed_university_name)
	  	expect(review).to have(1).errors_on(:unconfirmed_level)
	  end
	end

	context "with course_id" do
    it "is valid with a long body" do
      expect(build(:review)).to be_valid
    end
	end

  it "is invalid without a body at least 30 characters long" do
  	review = Review.new(body: "not long enough")
  	expect(review).to have(1).errors_on(:body)
  end

  # METHODS ################
  describe "#face_number" do
    it "gives a 1-5 face number based on 1-100 rating" do
    	expect(Review.new(teaching: 50).face_number(:teaching)).to eq 3
    end
  end

  describe "#unconfirmed?" do
    it "identifies reviews without a reviewed object as unconfirmed" do
      expect(build(:review, reviewable_id: nil)).to be_unconfirmed
    end
    it "identifies course reviews of a disabled university as unconfirmed" do
      review = create :course_review
      review.reviewable.university.update_attribute(:disabled, true)
    	expect(review.reload).to be_unconfirmed
    end
    it "identifies confirmed course reviews as not unconfirmed" do
      expect(build(:course_review)).not_to be_unconfirmed
    end
    it "identifies confirmed language school reviews as not unconfirmed" do
    	expect(build(:language_school_review)).not_to be_unconfirmed
    end
  end

  describe "#path" do
    it "gives the path for confirmed university and course" do
      review = create :course_review
      expect(review.path).to eq [review.reviewable.university, review.reviewable, review]
    end
    it "gives the path for confirmed university and unconfirmed course" do
      uni = create :university, name: "Monarch University"
      review = create :review, unconfirmed_university_name: "Monarch University"
      # We can't use [uni, review] right now. See Review#path.
      expect(review.path).to eq [review]
    end
    it "gives the path for confirmed language school" do
      review = create :language_school_review
      expect(review.path).to eq [review.reviewable, review]
    end
    it "gives the path for unconfirmed language school" do
      review = create :language_school_review, reviewable_id: nil
      expect(review.path).to eq [review]
    end
  end

end
