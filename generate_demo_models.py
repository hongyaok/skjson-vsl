import json
import os
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
import skjson

def generate_models():
    # We use a dataset with fewer features to keep the JSON sizes reasonable
    X, y = load_iris(return_X_y=True)
    feature_names = list(load_iris().feature_names)
    target_names = list(load_iris().target_names)
    
    # Map integer labels to string class names so sklearn sets model.classes_ to string names
    y_str = [target_names[i] for i in y]

    # 1. Decision Tree
    dt = DecisionTreeClassifier(max_depth=3, random_state=42).fit(X, y_str)
    
    # 2. Random Forest
    rf = RandomForestClassifier(n_estimators=10, max_depth=3, random_state=42).fit(X, y_str)
    
    # 3. Gradient Boosting
    gb = GradientBoostingClassifier(n_estimators=10, max_depth=3, random_state=42).fit(X, y_str)
    
    # 4. Linear Model
    lr = LogisticRegression(max_iter=10000, random_state=42).fit(X, y_str)
    # Write to demo/public
    public_dir = os.path.join("demo", "public")
    os.makedirs(public_dir, exist_ok=True)
    
    skjson.save(dt, os.path.join(public_dir, "decision_tree.json"), feature_names=feature_names)
    skjson.save(rf, os.path.join(public_dir, "random_forest.json"), feature_names=feature_names)
    skjson.save(gb, os.path.join(public_dir, "gradient_boosting.json"), feature_names=feature_names)
    skjson.save(lr, os.path.join(public_dir, "linear_model.json"), feature_names=feature_names)
        
    print("Successfully generated all demo models in demo/public/")

if __name__ == "__main__":
    generate_models()
