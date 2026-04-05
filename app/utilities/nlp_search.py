from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from typing import List, Dict, Any

def compute_eligibility_percentage(opportunity: Dict, user_details) -> int:
    """Calculate what percentage of criteria the user meets for a scheme."""
    if not user_details:
        return 0

    criteria_count = 8
    matches_count = 0

    # 1. Gender
    gender_req = str(opportunity.get("Gender_Eligibility", "")).lower()
    if "women only" in gender_req and user_details.gender.lower() != "female":
        pass
    elif "men only" in gender_req and user_details.gender.lower() != "male":
        pass
    else:
        matches_count += 1

    # 2. Education
    edu_req = str(opportunity.get("Education", "")).lower()
    user_edu = user_details.education.lower()
    if "primary" in edu_req and user_edu not in ["primary", "secondary", "higher secondary", "bachelor", "master", "phd"]:
        pass
    elif "secondary" in edu_req and user_edu not in ["secondary", "higher secondary", "bachelor", "master", "phd"]:
        pass
    else:
        matches_count += 1
        
    # 3. State
    state_req = str(opportunity.get("State", "")).lower()
    if "all india" not in state_req and user_details.state.lower() not in state_req:
        pass
    else:
        matches_count += 1

    # 4. Country
    country_req = str(opportunity.get("Country", "")).lower()
    if user_details.country.lower() not in country_req:
        pass
    else:
        matches_count += 1

    # 5. Caste
    caste_req = str(opportunity.get("Eligible_Caste", "")).lower()
    if "all categories" not in caste_req and user_details.caste.lower() not in caste_req:
        pass
    else:
        matches_count += 1

    # 6. Income
    income_req = str(opportunity.get("Eligible_Income", "")).lower()
    if "no income limit" not in income_req:
        if "low income" in income_req and user_details.income > 500000:
            pass
        elif "bpl" in income_req and user_details.income > 100000:
            pass
        else:
            matches_count += 1
    else:
        matches_count += 1

    # 7. Disability
    dis_req = str(opportunity.get("Disability_Eligibility", "")).lower()
    if "all" not in dis_req and user_details.disability.lower() not in dis_req:
        pass
    else:
        matches_count += 1

    # 8. Age Group
    age_req = str(opportunity.get("Eligible_Agegroup", "")).lower()
    
    def get_age_group(age: int) -> str:
        if age < 5: return "child"
        elif 5 <= age < 18: return "youth"
        elif 18 <= age < 60: return "adult"
        else: return "senior"

    user_age_group = get_age_group(user_details.age)
    if "all ages" not in age_req and user_age_group not in age_req:
        pass
    else:
        matches_count += 1

    return int((matches_count / criteria_count) * 100)

def analyze_eligibility(opportunity: Dict, user_details) -> Dict[str, Any]:
    """Analyze matching vs missing criteria and return detailed reasons."""
    result: Dict[str, Any] = {
        "percentage": 0,
        "matched_reasons": [],
        "unmatched_reasons": []
    }
    if not user_details:
        return result

    criteria_count = 8
    matches_count = 0

    # 1. Gender
    gender_req = str(opportunity.get("Gender_Eligibility", "")).lower()
    if "women only" in gender_req and user_details.gender.lower() != "female":
        result["unmatched_reasons"].append(f"Requires female gender (You are {user_details.gender})")
    elif "men only" in gender_req and user_details.gender.lower() != "male":
        result["unmatched_reasons"].append(f"Requires male gender (You are {user_details.gender})")
    else:
        matches_count += 1
        result["matched_reasons"].append("Gender criteria passed")

    # 2. Education
    edu_req = str(opportunity.get("Education", "")).lower()
    user_edu = user_details.education.lower()
    if "primary" in edu_req and user_edu not in ["primary", "secondary", "higher secondary", "bachelor", "master", "phd"]:
        result["unmatched_reasons"].append(f"Requires at least Primary education (Your education: {user_details.education})")
    elif "secondary" in edu_req and user_edu not in ["secondary", "higher secondary", "bachelor", "master", "phd"]:
        result["unmatched_reasons"].append(f"Requires at least Secondary education (Your education: {user_details.education})")
    else:
        matches_count += 1
        result["matched_reasons"].append(f"Education criteria passed (Your education: {user_details.education})")
        
    # 3. State
    state_req = str(opportunity.get("State", "")).lower()
    user_state = user_details.state.lower()
    if "all india" not in state_req and user_state not in state_req:
        result["unmatched_reasons"].append(f"Requires resident of {opportunity.get('State')} (You are from {user_details.state})")
    else:
        matches_count += 1
        result["matched_reasons"].append("State criteria passed")

    # 4. Country
    country_req = str(opportunity.get("Country", "")).lower()
    if user_details.country.lower() not in country_req:
        result["unmatched_reasons"].append(f"Requires resident of {opportunity.get('Country')} (You are from {user_details.country})")
    else:
        matches_count += 1
        result["matched_reasons"].append("Country criteria passed")

    # 5. Caste
    caste_req = str(opportunity.get("Eligible_Caste", "")).lower()
    if "all categories" not in caste_req and user_details.caste.lower() not in caste_req:
        result["unmatched_reasons"].append(f"Requires {opportunity.get('Eligible_Caste')} category (You are {user_details.caste})")
    else:
        matches_count += 1
        result["matched_reasons"].append("Caste/Category criteria passed")

    # 6. Income
    income_req = str(opportunity.get("Eligible_Income", "")).lower()
    if "no income limit" not in income_req:
        if "low income" in income_req and user_details.income > 500000:
            result["unmatched_reasons"].append(f"Requires low income (Your family income: ₹{user_details.income})")
        elif "bpl" in income_req and user_details.income > 100000:
            result["unmatched_reasons"].append(f"Requires BPL status (Your family income: ₹{user_details.income})")
        else:
            matches_count += 1
            result["matched_reasons"].append("Income criteria passed")
    else:
        matches_count += 1
        result["matched_reasons"].append("No specific income restrictions")

    # 7. Disability
    dis_req = str(opportunity.get("Disability_Eligibility", "")).lower()
    if "all" not in dis_req and user_details.disability.lower() not in dis_req:
        result["unmatched_reasons"].append(f"Requires specific disability status: {opportunity.get('Disability_Eligibility')} (Your status: {user_details.disability})")
    else:
        matches_count += 1
        result["matched_reasons"].append("Disability/Accessibility criteria passed")

    # 8. Age Group
    age_req = str(opportunity.get("Eligible_Agegroup", "")).lower()
    def get_age_group(age: int) -> str:
        if age < 5: return "child"
        elif 5 <= age < 18: return "youth"
        elif 18 <= age < 60: return "adult"
        else: return "senior"

    user_age_group = get_age_group(user_details.age)
    if "all ages" not in age_req and user_age_group not in age_req:
        result["unmatched_reasons"].append(f"Requires age group {opportunity.get('Eligible_Agegroup')} (You are {user_details.age} years old)")
    else:
        matches_count += 1
        result["matched_reasons"].append("Age criteria passed")

    result["percentage"] = int((matches_count / criteria_count) * 100)
    return result

def compute_eligibility_ml_naive_bayes(schemes: List[Dict], user_details) -> List[Dict]:
    """
    Uses a Naive Bayes classifier to predict the probability of eligibility for each scheme
    by training dynamically on synthetic eligibility labels generated by the rule-based engine.
    This demonstrates the integration of a Machine Learning model.
    """
    if not user_details or not schemes:
        return schemes
        
    texts = []
    labels = []
    
    # Generate synthetic training data using the rule-based engine as weak supervision
    for s in schemes:
        # Create a text representation of the scheme
        text_rep = f"{s.get('Title', '')} {s.get('Oppurtunity_category', '')} " \
                   f"{s.get('State', '')} {s.get('Gender_Eligibility', '')} " \
                   f"{s.get('Eligible_Caste', '')} {s.get('Education', '')}"
                   
        texts.append(text_rep)
        
        # Rule-based score serves as our baseline label
        rule_score = compute_eligibility_percentage(s, user_details)
        labels.append(1 if rule_score >= 50 else 0) # 1 = High Match, 0 = Low Match
        s['rule_based_percentage'] = rule_score

    # ML requires at least two classes to train. If data is too uniform, fallback to rules
    if len(set(labels)) < 2:
        for s in schemes:
            s['nb_probability'] = s['rule_based_percentage'] / 100.0
            s['nb_prediction'] = labels[0]
            s['eligibility_percentage'] = s['rule_based_percentage']
        return schemes

    try:
        # Text to Features via Bag of Words
        vectorizer = CountVectorizer(stop_words='english')
        X = vectorizer.fit_transform(texts)
        y = labels

        # Initialize and Train Naive Bayes Classifier
        nb_classifier = MultinomialNB()
        nb_classifier.fit(X, y)

        # Predict Probabilities
        probs = nb_classifier.predict_proba(X)
        preds = nb_classifier.predict(X)
        
        class_1_idx = list(nb_classifier.classes_).index(1)

        for i, s in enumerate(schemes):
            s['nb_probability'] = float(probs[i][class_1_idx])
            s['nb_prediction'] = int(preds[i])
            
            # Hybrid Recommendation System: Blend Rule-Based + Naive Bayes ML Probability
            hybrid_score = (s['rule_based_percentage'] * 0.5) + (s['nb_probability'] * 100 * 0.5)
            s['eligibility_percentage'] = int(hybrid_score)
            
    except Exception as e:
        print(f"Naive Bayes Model Error: {e}")
        # Fallback to rule-based directly
        for s in schemes:
            s['eligibility_percentage'] = s['rule_based_percentage']

    return schemes

def compute_eligibility_ml_logistic_regression(schemes: List[Dict], user_details) -> List[Dict]:
    """
    Uses Logistic Regression to predict the probability of eligibility for each scheme.
    This demonstrates the integration of a regression-based ML method that outputs probabilities.
    """
    if not user_details or not schemes:
        return schemes
        
    texts = []
    labels = []
    
    # Generate synthetic training data using the rule-based engine as weak supervision
    for s in schemes:
        text_rep = f"{s.get('Title', '')} {s.get('Oppurtunity_category', '')} " \
                   f"{s.get('State', '')} {s.get('Gender_Eligibility', '')} " \
                   f"{s.get('Eligible_Caste', '')} {s.get('Education', '')}"
                   
        texts.append(text_rep)
        
        # Rule-based score serves as our baseline label
        rule_score = compute_eligibility_percentage(s, user_details)
        labels.append(1 if rule_score >= 50 else 0) # 1 = High Match, 0 = Low Match
        s['rule_based_percentage'] = rule_score

    # ML requires at least two classes to train. If data is too uniform, fallback to rules
    if len(set(labels)) < 2:
        for s in schemes:
            s['lr_probability'] = s['rule_based_percentage'] / 100.0
            s['lr_prediction'] = labels[0]
            s['eligibility_percentage'] = s['rule_based_percentage']
        return schemes

    try:
        # Convert text into TF-IDF features for better regression weights
        vectorizer = TfidfVectorizer(stop_words='english')
        X = vectorizer.fit_transform(texts)
        y = labels

        # Initialize and Train Logistic Regression Model
        lr_model = LogisticRegression(max_iter=1000)
        lr_model.fit(X, y)

        # Predict Probabilities
        probs = lr_model.predict_proba(X)
        preds = lr_model.predict(X)
        
        class_1_idx = list(lr_model.classes_).index(1)

        for i, s in enumerate(schemes):
            s['lr_probability'] = float(probs[i][class_1_idx])
            s['lr_prediction'] = int(preds[i])
            
            # Hybrid Recommendation System: Blend Rule-Based + Logistic Regression Probability
            hybrid_score = (s['rule_based_percentage'] * 0.5) + (s['lr_probability'] * 100 * 0.5)
            s['eligibility_percentage'] = int(hybrid_score)
            
    except Exception as e:
        print(f"Logistic Regression Model Error: {e}")
        # Fallback to rule-based directly
        for s in schemes:
            s['eligibility_percentage'] = s['rule_based_percentage']

    return schemes

def search_schemes_nlp(query: str, schemes: List[Dict], top_k: int = 50) -> List[Dict]:
    """Search schemes using TF-IDF and Cosine Similarity."""
    if not query or not schemes:
        return []
    
    corpus = []
    for s in schemes:
        text = f"{s.get('Title', '')} {s.get('Oppurtunity_category', '')} {s.get('Organisation', '')} {s.get('Sector', '')}"
        corpus.append(text)
        
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus + [query])
    except ValueError:
        return []
        
    cosine_sim = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1]).flatten()
    top_indices = cosine_sim.argsort()[::-1][:top_k]
    
    results = []
    for idx in top_indices:
        if cosine_sim[idx] > 0.01:
            scheme = schemes[idx].copy()
            scheme['similarity_score'] = float(cosine_sim[idx])
            results.append(scheme)
            
    return results
