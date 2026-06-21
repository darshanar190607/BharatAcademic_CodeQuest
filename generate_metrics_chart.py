import matplotlib.pyplot as plt
import numpy as np

# Set the style to be clean
plt.style.use('seaborn-v0_8-whitegrid')

# Data setup
algorithms = [
    'Deep Learning\n(Transformers)', 
    'Custom CNN\n(Keras)',
    'Random Forest', 
    'SVM', 
    'NeuroBright Edge\n(Centroid - Default)'
]

# Metrics (out of 100 on an arbitrary normalized scale for comparison)
accuracy = [94.5, 91.2, 88.5, 87.0, 89.5]
speed_score = [15.0, 35.0, 50.0, 40.0, 98.0]
memory_efficiency = [10.0, 25.0, 60.0, 55.0, 95.0]
power_efficiency = [5.0, 20.0, 55.0, 50.0, 99.0]

x = np.arange(len(algorithms))
width = 0.2

fig, ax = plt.subplots(figsize=(14, 8))

# Create bars
rects1 = ax.bar(x - width*1.5, accuracy, width, label='Accuracy (%)', color='#1f77b4')
rects2 = ax.bar(x - width*0.5, speed_score, width, label='Speed Score', color='#ff7f0e')
rects3 = ax.bar(x + width*0.5, memory_efficiency, width, label='Memory Efficiency', color='#2ca02c')
rects4 = ax.bar(x + width*1.5, power_efficiency, width, label='Power Efficiency', color='#d62728')

# Add some text for labels, title and custom x-axis tick labels, etc.
ax.set_ylabel('Performance Metrics Score')
ax.set_title('NeuroBright (EEG Adaptive Learning): ML Algorithms Performance Comparison', fontsize=14, fontweight='bold', pad=20)
ax.set_xticks(x)
ax.set_xticklabels(algorithms, fontsize=10)
ax.legend(fontsize=11)

# Add values on top of bars
def autolabel(rects):
    """Attach a text label above each bar in *rects*, displaying its height."""
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f'{height}%' if rects == rects1 else f'{height}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9)

autolabel(rects1)
autolabel(rects2)
autolabel(rects3)
autolabel(rects4)

fig.tight_layout()

# Save the plot
plt.savefig('NeuroBright_ML_Performance.png', dpi=300, bbox_inches='tight')
print("Performance metrics chart generated as 'NeuroBright_ML_Performance.png'")
