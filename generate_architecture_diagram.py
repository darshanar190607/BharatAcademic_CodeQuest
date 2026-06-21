import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

# Setup the figure
fig, ax = plt.subplots(figsize=(6, 12))
ax.set_xlim(0, 10)
ax.set_ylim(0, 16)
ax.axis('off')

# Define the layers according to NeuroBright Architecture
layers = [
    ("EEG Data Acquisition Layer", "#e1f5fe", "#0288d1"),
    ("Signal Preprocessing Layer", "#e1f5fe", "#0288d1"),
    ("AI Inference Layer", "#e1f5fe", "#0288d1"),
    ("Decision-Making Layer", "#fff3e0", "#f57c00"),
    ("Communication Layer", "#e1f5fe", "#0288d1"),
    ("IoT Control Layer", "#e1f5fe", "#0288d1"),
    ("User Interface Layer", "#e1f5fe", "#0288d1")
]

# Parameters for drawing boxes
box_width = 7
box_height = 1.2
x_center = 5

current_y = 14

for i, (text, bcolor, ecolor) in enumerate(layers):
    is_decision = "Decision" in text
    
    # Coordinates mapping
    box_x = x_center - box_width/2
    box_y = current_y - box_height/2
    
    if is_decision:
        # Draw a hexagon-like shape for decision making layer (like in the image)
        poly = plt.Polygon([
            [x_center - box_width/2 - 0.5, current_y],
            [x_center - box_width/2 + 0.5, current_y + box_height/2],
            [x_center + box_width/2 - 0.5, current_y + box_height/2],
            [x_center + box_width/2 + 0.5, current_y],
            [x_center + box_width/2 - 0.5, current_y - box_height/2],
            [x_center - box_width/2 + 0.5, current_y - box_height/2]
        ], facecolor=bcolor, edgecolor=ecolor, linewidth=2)
        ax.add_patch(poly)
    else:
        # Normal rounded box representation (using FancyBboxPatch)
        box = mpatches.FancyBboxPatch((box_x, box_y), box_width, box_height,
                                      boxstyle="round,pad=0.1,rounding_size=0.3",
                                      facecolor=bcolor, edgecolor=ecolor, linewidth=2)
        ax.add_patch(box)

    # Add text
    font_weight = 'bold'
    ax.text(x_center, current_y, text, ha='center', va='center', 
            fontsize=12, fontweight=font_weight, color='black',
            fontfamily='sans-serif')
            
    # Draw arrow to next block
    if i < len(layers) - 1:
        arrow_start_y = current_y - box_height/2 - 0.1
        arrow_end_y = current_y - box_height - 0.7 + box_height/2
        
        ax.annotate('', xy=(x_center, arrow_end_y), xytext=(x_center, arrow_start_y),
                    arrowprops=dict(arrowstyle="->", color="gray", lw=2))
        
    current_y -= 2.0

plt.title("NeuroBright Software Architecture", fontsize=16, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig('NeuroBright_Architecture.png', dpi=300, bbox_inches='tight')
print("Architecture Diagram saved as 'NeuroBright_Architecture.png'")
